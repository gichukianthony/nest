import { Injectable } from '@nestjs/common';

//  information for a specific IP address
interface RateLimitInfo {
  count: number; // Number of requests
  resetTime: number; //  when the request window will reset
  blocked: boolean; // Indicates if the IP is currently blocked
  blockExpiry: number; // when the block will expire
}

//  response returned after checking/incrementing requests
interface RateLimitResponse {
  blocked: boolean; // Whether the IP is blocked
  remaining: number; // Number of requests remaining before blocking
}

@Injectable()
export class RateLimiterService {
  // Stores request info per IP address
  private readonly ipRequests: Map<string, RateLimitInfo> = new Map();

  private readonly MAX_REQUESTS: number = 2;

  private readonly WINDOW_MS: number = 600000; // (10 minutes)

  private readonly BLOCK_DURATION_MS: number = 300000; // (5 minutes)

  // Check if a given IP is currently blocked
  public isBlocked(ip: string): boolean {
    const info = this.ipRequests.get(ip);
    if (!info) return false;

    // If the IP is blocked, check if the block has expired
    if (info.blocked) {
      if (Date.now() > info.blockExpiry) {
        // Unblock the IP if block time has passed
        this.ipRequests.delete(ip);
        return false;
      }
      return true; // IP is still blocked
    }

    return false; // IP is not blocked
  }

  // Increment the request count for a given IP and return its rate limit status
  public increment(ip: string): RateLimitResponse {
    const now = Date.now();
    let info = this.ipRequests.get(ip);

    // If no record exists for the IP, initialize it
    if (!info) {
      info = {
        count: 0,
        resetTime: now + this.WINDOW_MS,
        blocked: false,
        blockExpiry: 0,
      };
    }

    // Reset the request count if the time window has expired
    if (now > info.resetTime) {
      info.count = 0;
      info.resetTime = now + this.WINDOW_MS;
    }

    // Increment the request count
    info.count++;

    // If the count exceeds the max allowed requests, block the IP
    if (info.count > this.MAX_REQUESTS) {
      info.blocked = true;
      info.blockExpiry = now + this.BLOCK_DURATION_MS;
      this.ipRequests.set(ip, info);
      return { blocked: true, remaining: 0 };
    }

    // Update the request info for the IP
    this.ipRequests.set(ip, info);
    return { blocked: false, remaining: this.MAX_REQUESTS - info.count };
  }

  // Get the number of remaining requests allowed for a given IP
  public getRemainingAttempts(ip: string): number {
    const info = this.ipRequests.get(ip);
    if (!info) return this.MAX_REQUESTS; // No requests made yet
    return Math.max(0, this.MAX_REQUESTS - info.count);
  }

  // Get the timestamp when the block will expire for a blocked IP
  public getBlockExpiry(ip: string): number | null {
    const info = this.ipRequests.get(ip);
    if (!info || !info.blocked) return null;
    return info.blockExpiry;
  }
}
