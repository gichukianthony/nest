// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    const methodColor = '\x1b[36m'; // Cyan
    const reset = '\x1b[0m';
    const yellow = '\x1b[33m';
    const green = '\x1b[32m';
    const bold = '\x1b[1m';

    console.log(
      `📥 ${yellow}${new Date().toISOString()}${reset} ${methodColor}${req.method}${reset} ${bold}${req.originalUrl}${reset}`,
    );

    const originalEnd = res.end.bind(res) as Response['end'];

    res.end = function (...args: Parameters<Response['end']>): Response {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode < 400 ? green : '\x1b[31m'; // red if error

      console.log(
        `✅ ${yellow}${new Date().toISOString()}${reset} ${methodColor}${req.method}${reset} ${req.originalUrl} - ${statusColor}${res.statusCode}${reset} ⏱️ ${bold}${duration}ms${reset}`,
      );

      return originalEnd.apply(res, args) as Response;
    } as Response['end'];

    next();
  }
}
