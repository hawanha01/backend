import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/paginated-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode?: number }>();
    const status = response.statusCode || 200;

    return next.handle().pipe(
      map((data: T) => ({
        status,
        message: this.getSuccessMessage(context, status),
        data,
      })),
    );
  }

  private getSuccessMessage(
    context: ExecutionContext,
    _status: number,
  ): string {
    const handler = context.getHandler();
    const handlerName = handler.name;

    // Auth endpoints
    if (handlerName === 'login') {
      return 'Login successful';
    }
    if (handlerName === 'refresh') {
      return 'Token refreshed successfully';
    }

    // Generic success messages based on HTTP method
    const request = context.switchToHttp().getRequest<{ method?: string }>();
    const method = request.method;

    if (method === 'POST') {
      return 'Resource created successfully';
    }
    if (method === 'PUT' || method === 'PATCH') {
      return 'Resource updated successfully';
    }
    if (method === 'DELETE') {
      return 'Resource deleted successfully';
    }

    return 'Request successful';
  }
}
