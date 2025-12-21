import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { RateLimitMiddleware } from './middleware/rate-limit.middleware'

@Module({})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes('*')
  }
}

