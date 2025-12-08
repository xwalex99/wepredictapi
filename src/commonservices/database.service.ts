import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from './db.provider';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  /**
   * Ejecuta una consulta SQL y retorna las filas.
   * Para procedimientos MySQL (CALL) devuelve la primera result set.
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    // Retornamos exactamente lo que mysql2/promise devuelve en rows.
    // Puede ser: RowDataPacket[] | RowDataPacket[][] dependiendo del query (CALL devuelve array de resultsets).
    const [rows] = await this.pool.query<RowDataPacket[] | RowDataPacket[][]>(sql, params);
    return rows;
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  async transaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await this.getConnection();
    try {
      await conn.beginTransaction();
      const res = await fn(conn);
      await conn.commit();
      return res;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}
