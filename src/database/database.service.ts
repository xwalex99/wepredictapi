import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dbConfig = this.configService.get('database');
    this.pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      ssl: dbConfig.ssl,
    });

    // Test connection
    try {
      await this.pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * Ejecuta una función de PostgreSQL
   * @param functionName Nombre de la función a ejecutar
   * @param params Parámetros a pasar a la función
   * @returns Resultado de la función
   */
  async callFunction<T>(functionName: string, params: any[] = []): Promise<T> {
    const client = await this.pool.connect();
    try {
      const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');
      const query = `SELECT * FROM ${functionName}(${placeholders})`;
      
      const result = await client.query(query, params);
      
      // Si la función retorna una sola fila, retornamos el primer elemento
      if (result.rows.length === 1) {
        return result.rows[0] as T;
      }
      
      // Si retorna múltiples filas, retornamos el array
      return result.rows as T;
    } catch (error) {
      console.error(`Error calling function ${functionName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta una query SQL directa
   * @param query Query SQL
   * @param params Parámetros
   * @returns Resultado de la query
   */
  async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene un cliente de la pool para transacciones manuales
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }
}

