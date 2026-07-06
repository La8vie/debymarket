import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export function RateLimit(limit: number, ttl: number) {
  return applyDecorators(
    Throttle({ default: { limit, ttl } }),
  );
}

export const RateLimits = {
  login: () => RateLimit(5, 60), // 5 requests per minute
  register: () => RateLimit(3, 60), // 3 requests per minute
  public: () => RateLimit(100, 60), // 100 requests per minute
  auth: () => RateLimit(50, 60), // 50 requests per minute
  admin: () => RateLimit(200, 60), // 200 requests per minute
};
