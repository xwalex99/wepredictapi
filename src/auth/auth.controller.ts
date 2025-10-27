import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthBll } from './auth.bll';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleTokenDto } from './dto/google-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authBll: AuthBll) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario (Local)' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Email ya registrado o datos inválidos' })
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
  @ApiOperation({ summary: 'Iniciar sesión (Local)' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
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
  @ApiOperation({ summary: 'Registrar usuario con Google (Legacy)' })
  @ApiResponse({ status: 201, description: 'Usuario registrado con Google' })
  @ApiResponse({ status: 400, description: 'Error al registrar' })
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
  @ApiOperation({ summary: 'Iniciar sesión con Google (Legacy)' })
  @ApiResponse({ status: 200, description: 'Login con Google exitoso' })
  @ApiResponse({ status: 401, description: 'Error al iniciar sesión' })
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
  @ApiOperation({ summary: 'Autenticación con Google OAuth (Recomendado)' })
  @ApiResponse({ status: 200, description: 'Autenticación exitosa' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async googleCallback(@Body() googleTokenDto: GoogleTokenDto) {
    const user = await this.authBll.loginOrRegisterWithGoogle(googleTokenDto);
    return {
      success: true,
      message: 'Autenticación con Google exitosa',
      data: this.authBll.sanitizeUser(user),
    };
  }
}

