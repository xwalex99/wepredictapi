import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryConfig } from 'pg';
import { PG_POOL } from './db.provider';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T extends Record<string, any> = Record<string, any>>(
    text: string | QueryConfig,
    params?: any[],
  ): Promise<{ rows: T[] }> {
    return this.pool.query(text as any, params) as unknown as Promise<{ rows: T[] }>;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const res = await fn(client);
      await client.query('COMMIT');
      return res;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
