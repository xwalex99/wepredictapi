import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class CommonDal {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Ejecuta un procedimiento almacenado en la BD
   * @param procedureName - Nombre del procedimiento (ej: sp_register_user)
   * @param params - Parámetros del procedimiento
   * @returns Resultado del procedimiento
   */
  async callProcedure<T extends Record<string, any> = Record<string, any>>(
    procedureName: string,
    params: any[] = [],
  ): Promise<{ rows: T[] }> {
    // Construir la llamada al procedimiento con parámetros posicionales
    const paramPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');
    const query = `SELECT * FROM ${procedureName}(${paramPlaceholders})`;
    return this.db.query<T>(query, params);
  }

  /**
   * Ejecuta un procedimiento y retorna solo las filas
   */
  async callProcedureRows<T extends Record<string, any> = Record<string, any>>(
    procedureName: string,
    params: any[] = [],
  ): Promise<T[]> {
    const result = await this.callProcedure<T>(procedureName, params);
    return result.rows;
  }

  /**
   * Ejecuta un procedimiento y retorna la primera fila
   */
  async callProcedureOne<T extends Record<string, any> = Record<string, any>>(
    procedureName: string,
    params: any[] = [],
  ): Promise<T | null> {
    const result = await this.callProcedure<T>(procedureName, params);
    return result.rows[0] || null;
  }
}
