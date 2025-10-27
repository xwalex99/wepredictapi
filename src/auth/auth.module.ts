import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthBll } from './auth.bll';
import { AuthDal } from './auth.dal';
import { GoogleOAuthService } from './google-oauth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthBll, AuthDal, GoogleOAuthService],
  exports: [AuthBll],
})
export class AuthModule {}
