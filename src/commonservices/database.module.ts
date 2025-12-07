import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { pgPoolProvider } from './db.provider';

@Module({
  providers: [pgPoolProvider, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
