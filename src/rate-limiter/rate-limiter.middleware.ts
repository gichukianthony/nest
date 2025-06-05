import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from './rate-limiter.service';

interface RateLimitErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  use(req: Request, res: Response, next: NextFunction) {
    //getting client ip
    const ip: string = req.ip || req.socket?.remoteAddress || 'unknown';
    //check if the ip is blocked
    if (this.rateLimiterService.isBlocked(ip)) {
      const blockExpiry: number | null =
        this.rateLimiterService.getBlockExpiry(ip);
      const timeLeft: number = blockExpiry
        ? Math.ceil((blockExpiry - Date.now()) / 1000)
        : 0;

      const errorResponse: RateLimitErrorResponse = {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Too many requests. IP blocked. Try again in ${timeLeft} seconds.`,
        error: 'Too Many Requests',
      };

      throw new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }
    //update the ip request info
    const { blocked, remaining } = this.rateLimiterService.increment(ip);
    //   if blocked after increments
    if (blocked) {
      const errorResponse: RateLimitErrorResponse = {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. IP has been blocked for 5 minutes.',
        error: 'Too Many Requests',
      };

      throw new HttpException(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }
    // setting header for client
    res.setHeader('X-RateLimit-Limit', '5');
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    next();
  }
}
