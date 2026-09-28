import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
    this.client.connect().then(() => (this.connected = true));
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.connected) return;
    await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  async invalidate(key: string): Promise<void> {
    if (!this.connected) return;
    await this.client.del(key);
  }

  /** Get-or-compute: return the cached value if present, otherwise run
   * `compute`, cache its result, and return it. This is the pattern every
   * caller should use rather than manually checking-then-setting. */
  async getOrSet<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async onModuleDestroy() {
    if (this.connected) await this.client.quit();
  }
}
