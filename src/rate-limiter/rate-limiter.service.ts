import { Injectable } from '@nestjs/common';

interface RateLimitInfo {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry: number;
}

interface RateLimitResponse {
  blocked: boolean;
  remaining: number;
}

@Injectable()
export class RateLimiterService {
  private readonly ipRequests: Map<string, RateLimitInfo> = new Map<
    string,
    RateLimitInfo
  >();
  private readonly MAX_REQUESTS: number = 5;
  private readonly WINDOW_MS: number = 60000; // 1 minute
  private readonly BLOCK_DURATION_MS: number = 3600000; // 1 hour

  public isBlocked(ip: string): boolean {
    const info: RateLimitInfo | undefined = this.ipRequests.get(ip);
    if (!info) return false;

    if (info.blocked) {
      if (Date.now() > info.blockExpiry) {
        this.ipRequests.delete(ip);
        return false;
      }
      return true;
    }
    return false;
  }

  public increment(ip: string): RateLimitResponse {
    const now: number = Date.now();
    let info: RateLimitInfo | undefined = this.ipRequests.get(ip);

    if (!info) {
      info = {
        count: 0,
        resetTime: now + this.WINDOW_MS,
        blocked: false,
        blockExpiry: 0,
      };
    }

    if (now > info.resetTime) {
      info.count = 0;
      info.resetTime = now + this.WINDOW_MS;
    }

    info.count++;

    if (info.count > this.MAX_REQUESTS) {
      info.blocked = true;
      info.blockExpiry = now + this.BLOCK_DURATION_MS;
      this.ipRequests.set(ip, info);
      return { blocked: true, remaining: 0 };
    }

    this.ipRequests.set(ip, info);
    return { blocked: false, remaining: this.MAX_REQUESTS - info.count };
  }

  public getRemainingAttempts(ip: string): number {
    const info: RateLimitInfo | undefined = this.ipRequests.get(ip);
    if (!info) return this.MAX_REQUESTS;
    return Math.max(0, this.MAX_REQUESTS - info.count);
  }

  public getBlockExpiry(ip: string): number | null {
    const info: RateLimitInfo | undefined = this.ipRequests.get(ip);
    if (!info || !info.blocked) return null;
    return info.blockExpiry;
  }
}
