import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID not found in environment variables');
    }

    this.client = new OAuth2Client(clientId);
  }

  /**
   * Verifica un ID token de Google y devuelve los datos del usuario
   */
  async verifyIdToken(idToken: string): Promise<{
    google_sub: string;
    email: string;
    full_name: string;
  }> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        google_sub: payload.sub,
        email: payload.email || '',
        full_name: payload.name || payload.email || 'Google User',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Google token');
    }
  }
}

