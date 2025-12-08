import { Provider } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';

export const DB_POOL = 'DB_POOL';

export const dbPoolProvider: Provider = {
  provide: DB_POOL,
  useFactory: () => {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || '';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const pool: Pool = createPool({ host, user, password, database, port, connectionLimit: 10 });
    return pool;
  },
};
