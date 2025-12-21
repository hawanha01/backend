import { HttpException, HttpStatus } from '@nestjs/common'

export class CustomException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    errors?: string[],
  ) {
    super(
      {
        message,
        errors,
      },
      statusCode,
    )
  }
}

