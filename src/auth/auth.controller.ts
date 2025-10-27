import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthBll } from './auth.bll';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleTokenDto } from './dto/google-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authBll: AuthBll) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authBll.register(registerDto);
    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: this.authBll.sanitizeUser(user),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authBll.login(loginDto);
    return {
      success: true,
      message: 'Login exitoso',
      data: this.authBll.sanitizeUser(user),
    };
  }

  @Post('register/google')
  @HttpCode(HttpStatus.CREATED)
  async registerGoogle(@Body() googleAuthDto: GoogleAuthDto) {
    const user = await this.authBll.registerGoogle(googleAuthDto);
    return {
      success: true,
      message: 'Usuario registrado con Google exitosamente',
      data: this.authBll.sanitizeUser(user),
    };
  }

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  async loginGoogle(@Body() googleAuthDto: GoogleAuthDto) {
    const user = await this.authBll.loginGoogle(googleAuthDto);
    return {
      success: true,
      message: 'Login con Google exitoso',
      data: this.authBll.sanitizeUser(user),
    };
  }

  @Post('google/callback')
  @HttpCode(HttpStatus.OK)
  async googleCallback(@Body() googleTokenDto: GoogleTokenDto) {
    const user = await this.authBll.loginOrRegisterWithGoogle(googleTokenDto);
    return {
      success: true,
      message: 'Autenticación con Google exitosa',
      data: this.authBll.sanitizeUser(user),
    };
  }
}

