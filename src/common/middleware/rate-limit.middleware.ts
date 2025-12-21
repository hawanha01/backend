import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ConfigService } from '@nestjs/config'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {}
  private readonly windowMs: number
  private readonly maxRequests: number
  private readonly cleanupInterval: number

  constructor(private readonly configService: ConfigService) {
    // Get rate limit config from environment or use defaults
    this.windowMs =
      parseInt(this.configService.get<string>('RATE_LIMIT_WINDOW_MS') || '900000') || 900000 // 15 minutes default
    this.maxRequests =
      parseInt(this.configService.get<string>('RATE_LIMIT_MAX_REQUESTS') || '100') || 100
    this.cleanupInterval = 60000 // Clean up every minute

    // Start cleanup interval
    setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const key = this.getKey(req)
    const now = Date.now()

    // Initialize or get existing entry
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      }
    }

    const entry = this.store[key]

    // Reset if window has passed
    if (now > entry.resetTime) {
      entry.count = 0
      entry.resetTime = now + this.windowMs
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      res.setHeader('Retry-After', retryAfter.toString())
      res.setHeader('X-RateLimit-Limit', this.maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', '0')
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())

      throw new HttpException(
        {
          message: 'Too many requests, please try again later',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    // Increment count
    entry.count++

    // Set rate limit headers
    const remaining = Math.max(0, this.maxRequests - entry.count)
    res.setHeader('X-RateLimit-Limit', this.maxRequests.toString())
    res.setHeader('X-RateLimit-Remaining', remaining.toString())
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())

    next()
  }

  private getKey(req: Request): string {
    // Use IP address as the key, or user ID if authenticated
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const userId = (req as any).user?.id

    if (userId) {
      return `user:${userId}`
    }

    return `ip:${ip}`
  }

  private cleanup(): void {
    const now = Date.now()
    const keys = Object.keys(this.store)

    for (const key of keys) {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    }
  }
}

