import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dbConfig = this.configService.get('database');
    const isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
    // DB_REQUIRED must be explicitly 'true' to require DB. Default is to allow graceful failure.
    const dbRequired = process.env.DB_REQUIRED === 'true';
    
    try {
      this.pool = new Pool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        ssl: dbConfig.ssl,
        // Add connection timeout for serverless environments
        connectionTimeoutMillis: 5000,
        max: 2, // Limit connections for serverless
      });

      // Test connection
      try {
        await this.pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
        // Si es un error de DNS, dar más información
        if (error.code === 'ENOTFOUND') {
          console.error(`⚠️  Cannot resolve hostname: ${dbConfig.host}`);
          console.error('💡 Check your DB_HOST environment variable. Supabase hosts typically look like:');
          console.error('   aws-0-[region].pooler.supabase.com (for connection pooling)');
          console.error('   Or check your Supabase dashboard for the correct connection string');
          console.error('\n💡 To allow the app to run without a database, set DB_REQUIRED=false');
          console.error('💡 To require a database connection, set DB_REQUIRED=true');
        }
        
        // If DB is not required (default), or we're in production/serverless, continue without DB
        if (!dbRequired) {
          console.warn('⚠️  Continuing without database connection. Database operations will fail.');
          this.pool = null;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Error initializing database pool:', error.message);
      
      // Si es un error de DNS, dar más información
      if (error.code === 'ENOTFOUND') {
        console.error(`⚠️  Cannot resolve hostname: ${dbConfig.host}`);
        console.error('💡 Check your DB_HOST environment variable. Supabase hosts typically look like:');
        console.error('   aws-0-[region].pooler.supabase.com (for connection pooling)');
        console.error('   Or check your Supabase dashboard for the correct connection string');
        console.error('\n💡 To allow the app to run without a database, set DB_REQUIRED=false');
        console.error('💡 To require a database connection, set DB_REQUIRED=true');
      }
      
      // If DB is not required (default), continue without DB
      if (!dbRequired) {
        console.warn('⚠️  Continuing without database connection. Database operations will fail.');
        this.pool = null;
      } else {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  /**
   * Ejecuta una función de PostgreSQL
   * @param functionName Nombre de la función a ejecutar
   * @param params Parámetros a pasar a la función
   * @returns Resultado de la función
   */
  async callFunction<T>(functionName: string, params: any[] = []): Promise<T> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Check environment variables and database connection.');
    }
    
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
    if (!this.pool) {
      throw new Error('Database pool not initialized. Check environment variables and database connection.');
    }
    
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
    if (!this.pool) {
      throw new Error('Database pool not initialized. Check environment variables and database connection.');
    }
    return await this.pool.connect();
  }
}

