import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface ValidationErrorResponse {
  property: string;
  value?: unknown;
  constraints?: Record<string, string>;
  children?: ValidationErrorResponse[];
}

@Injectable()
export class ValidationPipe implements PipeTransform<unknown, unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    }) as Record<string, unknown>;
    const errors = await validate(object as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validationError: {
        target: false,
        value: false,
      },
    });

    if (errors.length > 0) {
      const validationErrors = this.formatValidationErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(
    errors: ValidationError[],
  ): ValidationErrorResponse[] {
    return errors.map((error) => {
      const formattedError: ValidationErrorResponse = {
        property: error.property,
      };

      if (error.value !== undefined) {
        formattedError.value = error.value;
      }

      if (error.constraints) {
        formattedError.constraints = error.constraints;
      }

      if (error.children && error.children.length > 0) {
        formattedError.children = this.formatValidationErrors(error.children);
      }

      return formattedError;
    });
  }
}
