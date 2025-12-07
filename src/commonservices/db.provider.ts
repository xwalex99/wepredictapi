import { Provider } from '@nestjs/common';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

export const pgPoolProvider: Provider = {
  provide: PG_POOL,
  useFactory: () => {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'postgres';
    const port = parseInt(process.env.DB_PORT || '5432', 10);
    const pool = new Pool({ host, user, password, database, port });
    return pool;
  },
};
