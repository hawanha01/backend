# Common Module

This module contains shared utilities, filters, pipes, and middleware used across the application.

## Exception Filter

The `AllExceptionsFilter` is a global exception filter that handles all exceptions in the application. It provides:

- Consistent error response format
- Proper handling of validation errors (including nested objects)
- Logging for debugging
- Support for both HttpException and generic Error types

### Error Response Format

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "message": "Validation failed",
  "errors": ["email: must be an email", "address.city: must be a string"],
  "validationErrors": [
    {
      "property": "email",
      "value": "invalid-email",
      "constraints": {
        "isEmail": "email must be an email"
      }
    },
    {
      "property": "address",
      "children": [
        {
          "property": "city",
          "constraints": {
            "isString": "city must be a string"
          }
        }
      ]
    }
  ]
}
```

## Validation Pipe

The `ValidationPipe` handles DTO validation with full support for nested objects. It:

- Validates all DTO properties
- Handles nested object validation
- Provides detailed error messages with property paths
- Transforms plain objects to DTO instances
- Whitelists properties (removes unknown properties)
- Forbids non-whitelisted properties

### Usage Example

```typescript
// user.dto.ts
import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

## Rate Limiting Middleware

The `RateLimitMiddleware` provides custom rate limiting functionality:

- Configurable window and max requests
- Per-IP or per-user rate limiting
- Automatic cleanup of expired entries
- Rate limit headers in responses

### Configuration

Set these environment variables:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100  # Maximum requests per window
```

### Response Headers

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: When the rate limit window resets
- `Retry-After`: Seconds to wait before retrying (when limit exceeded)

## CORS Configuration

CORS is configured in `main.ts` with the following settings:

- Configurable origins (supports multiple origins via comma-separated list)
- Credentials support
- Standard HTTP methods
- Custom headers support

### Configuration

```env
CORS_ORIGIN=*  # or comma-separated list: http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
```

## Utility Functions

### Pagination

```typescript
import { createPaginatedResponse } from './common/utils/pagination.util';

const response = createPaginatedResponse(users, total, page, limit);
```

### Response

```typescript
import { createResponse } from './common/utils/response.util';

const response = createResponse(user, 'User created successfully', 201);
```

