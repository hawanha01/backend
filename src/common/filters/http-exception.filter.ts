import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  property: string;
  value?: unknown;
  constraints?: Record<string, string>;
  children?: ValidationError[];
}

interface ExceptionResponse {
  message?: string | string[];
  errors?: ValidationError[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];
    let validationErrors: ValidationError[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as ExceptionResponse;

        // Handle message
        if (responseObj.message) {
          if (Array.isArray(responseObj.message)) {
            message = responseObj.message[0] || message;
            errors = responseObj.message;
          } else {
            message = responseObj.message;
          }
        }

        // Handle validation errors (from class-validator)
        if (responseObj.errors && Array.isArray(responseObj.errors)) {
          validationErrors = responseObj.errors;
          errors = this.flattenValidationErrors(responseObj.errors);
        }

        // Handle error field
        if (responseObj.error && !message) {
          message = responseObj.error;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );
    } else {
      this.logger.error(
        `Unknown exception: ${JSON.stringify(exception)}`,
        undefined,
        `${request.method} ${request.url}`,
      );
    }

    const errorResponse: {
      statusCode: number;
      timestamp: string;
      path: string;
      method: string;
      message: string;
      errors?: string[];
      validationErrors?: ValidationError[];
    } = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (errors.length > 0) {
      errorResponse.errors = errors;
    }

    if (validationErrors.length > 0) {
      errorResponse.validationErrors = validationErrors;
    }

    // Log error for debugging (except for client errors)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `HTTP ${status} Error: ${message}`,
        JSON.stringify(errorResponse, null, 2),
        `${request.method} ${request.url}`,
      );
    } else {
      this.logger.warn(
        `HTTP ${status} Error: ${message}`,
        `${request.method} ${request.url}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private flattenValidationErrors(
    validationErrors: ValidationError[],
    parentPath = '',
  ): string[] {
    const errors: string[] = [];

    for (const error of validationErrors) {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        const constraintMessages = Object.values(error.constraints);
        errors.push(
          ...constraintMessages.map((msg) => `${propertyPath}: ${msg}`),
        );
      }

      if (error.children && error.children.length > 0) {
        errors.push(
          ...this.flattenValidationErrors(error.children, propertyPath),
        );
      }
    }

    return errors;
  }
}
