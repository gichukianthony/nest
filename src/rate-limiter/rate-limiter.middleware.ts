import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
    constructor(private readonly rateLimiterService: RateLimiterService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const ip = (req.ip || req.connection.remoteAddress || 'unknown') as string;

        if (this.rateLimiterService.isBlocked(ip)) {
            const blockExpiry = this.rateLimiterService.getBlockExpiry(ip);
            const timeLeft = blockExpiry ? Math.ceil((blockExpiry - Date.now()) / 1000) : 0;

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: `Too many requests. IP blocked. Try again in ${timeLeft} seconds.`,
                    error: 'Too Many Requests',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        const { blocked, remaining } = this.rateLimiterService.increment(ip);

        if (blocked) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. IP has been blocked for 1 hour.',
                    error: 'Too Many Requests',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        res.setHeader('X-RateLimit-Limit', '5');
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        next();
    }
} 