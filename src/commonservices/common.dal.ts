import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class CommonDal {
  constructor(private readonly db: DatabaseService) {}

  async callProcedure(procedureName: string, params: any[] = []): Promise<any> {
    const paramPlaceholders = params.map(() => '?').join(', ');
    const query = `CALL ${procedureName}(${paramPlaceholders})`;
    return this.db.query(query, params);
  }
}
