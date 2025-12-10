import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';

export const DB_POOL = 'DB_POOL';

export const dbPoolProvider: Provider = {
  provide: DB_POOL,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    // Prefer IPv4 loopback to avoid ::1 issues on some Windows setups
    const host = config.get<string>('DB_HOST') || '127.0.0.1';
    const user = config.get<string>('DB_USER') || 'root';
    const password = config.get<string>('DB_PASSWORD') || '';
    const database = config.get<string>('DB_NAME') || '';
    const port = parseInt(config.get<string>('DB_PORT') || '3306', 10);

    const pool: Pool = createPool({
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10,
      waitForConnections: true,
    });
    return pool;
  },
};
