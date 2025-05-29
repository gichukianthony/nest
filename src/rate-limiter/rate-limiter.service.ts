import { Injectable } from '@nestjs/common';

interface RateLimitInfo {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockExpiry: number;
}

@Injectable()
export class RateLimiterService {
    private readonly ipRequests = new Map<string, RateLimitInfo>();
    private readonly MAX_REQUESTS = 5;
    private readonly WINDOW_MS = 60000; // 1 minute
    private readonly BLOCK_DURATION_MS = 3600000; // 1 hour

    isBlocked(ip: string): boolean {
        const info = this.ipRequests.get(ip);
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

    increment(ip: string): { blocked: boolean; remaining: number } {
        const now = Date.now();
        let info = this.ipRequests.get(ip);

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

    getRemainingAttempts(ip: string): number {
        const info = this.ipRequests.get(ip);
        if (!info) return this.MAX_REQUESTS;
        return Math.max(0, this.MAX_REQUESTS - info.count);
    }

    getBlockExpiry(ip: string): number | null {
        const info = this.ipRequests.get(ip);
        if (!info || !info.blocked) return null;
        return info.blockExpiry;
    }
} 