import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { dbPoolProvider } from './db.provider';

@Module({
  providers: [dbPoolProvider, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
