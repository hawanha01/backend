import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Type,
} from '@nestjs/common'
import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'

interface ValidationErrorResponse {
  property: string
  value?: unknown
  constraints?: Record<string, string>
  children?: ValidationErrorResponse[]
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      skipMissingProperties: false,
      validationError: {
        target: false,
        value: false,
      },
    })

    if (errors.length > 0) {
      const validationErrors = this.formatValidationErrors(errors)
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
      })
    }

    return object
  }

  private toValidate(metatype: Type<any>): boolean {
    const types: Type<any>[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }

  private formatValidationErrors(
    errors: ValidationError[],
  ): ValidationErrorResponse[] {
    return errors.map((error) => {
      const formattedError: ValidationErrorResponse = {
        property: error.property,
      }

      if (error.value !== undefined) {
        formattedError.value = error.value
      }

      if (error.constraints) {
        formattedError.constraints = error.constraints
      }

      if (error.children && error.children.length > 0) {
        formattedError.children = this.formatValidationErrors(error.children)
      }

      return formattedError
    })
  }
}

