import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserBll } from './user.bll';
import { UserDal } from './user.dal';
import { CommonDal } from '../commonservices/common.dal';
import { DatabaseModule } from '../commonservices/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [UserBll, UserDal, CommonDal],
})
export class UserModule {}
