import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { UserBll } from './user.bll';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './user.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('auth')
export class UserController {
  constructor(private readonly userBll: UserBll) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.userBll.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.userBll.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    // req.user viene del JWT payload (userId, email, username)
    return this.userBll.getUserInfo(req.user.userId);
  }
}
