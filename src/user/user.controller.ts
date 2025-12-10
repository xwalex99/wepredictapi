import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBll } from './user.bll';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './user.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('auth')
@ApiTags('auth')
export class UserController {
  constructor(private readonly userBll: UserBll) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar usuario local' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.userBll.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login local' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.userBll.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Requiere token JWT en el header Authorization. El ID del usuario se extrae del token decodificado.'
  })
  @ApiResponse({ status: 200, type: UserResponseDto, description: 'Datos del usuario obtenidos por ID desde el token' })
  @ApiResponse({ status: 401, description: 'Token no válido o ausente' })
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    // req.user viene del JWT payload validado por JwtStrategy (userId, email, username)
    // El guard JwtGuard garantiza que el token es válido antes de llegar aquí
    if (!req.user || !req.user.userId) {
      throw new Error('Usuario no encontrado en el token');
    }
    return this.userBll.getUserInfo(req.user.userId);
  }
}
