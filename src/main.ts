import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from './config/env'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { ValidationPipe } from './common/pipes/validation.pipe'
import { JwtAuthGuard } from './module/auth/guards/jwt-auth.guard'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({
    origin: config.cors.origin === '*' ? true : config.cors.origin.split(','),
    // credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  })

  // Global prefix (optional)
  app.setGlobalPrefix('api')

  // Global exception filter - handles ALL exceptions
  app.useGlobalFilters(new AllExceptionsFilter())

  // Global validation pipe - handles DTO validation with nested object support
  app.useGlobalPipes(new ValidationPipe())

  // Global JWT guard - protects all routes except those marked with @Public()
  const reflector = app.get(Reflector)
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  // Swagger Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('The e-commerce API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(config.port)
  console.log(`Application is running on: http://localhost:${config.port}/api`)
}

bootstrap()
