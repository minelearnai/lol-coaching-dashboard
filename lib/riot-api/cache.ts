import Redis from 'ioredis';

// Redis Cache Implementation
class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private useMemoryFallback: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Try to connect to Redis (Upstash for Vercel)
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          lazyConnect: true,
        });
        
        await this.redis.ping();
        console.log('✅ Redis cache initialized successfully');
      } else {
        console.log('⚠️ No REDIS_URL found, using memory cache fallback');
        this.useMemoryFallback = true;
      }
    } catch (error) {
      console.error('❌ Redis connection failed, falling back to memory cache:', error);
      this.useMemoryFallback = true;
      this.redis = null;
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Memory cache fallback
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Memory cache fallback
        this.memoryCache.set(key, {
          data: value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
        
        // Clean old entries periodically
        if (this.memoryCache.size > 100) {
          this.cleanMemoryCache();
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  private cleanMemoryCache() {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiry < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        await this.redis.flushall();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  // Generate cache keys
  static generateKey(type: string, identifier: string, extra?: string): string {
    const base = `lol-coach:${type}:${identifier}`;
    return extra ? `${base}:${extra}` : base;
  }
}

// Export singleton instance
export const cache = new CacheService();