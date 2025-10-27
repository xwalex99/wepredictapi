import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    
    // Initialize OAuth client lazily to avoid throwing during module initialization
    if (clientId) {
      this.client = new OAuth2Client(clientId);
    } else {
      console.warn('⚠️ GOOGLE_CLIENT_ID not found in environment variables. Google OAuth will not work.');
      this.client = null as any; // Will be initialized on first use
    }
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
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      
      if (!clientId) {
        throw new UnauthorizedException('Google OAuth not configured. Missing GOOGLE_CLIENT_ID.');
      }

      // Lazy initialization if needed
      if (!this.client) {
        this.client = new OAuth2Client(clientId);
      }

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: clientId,
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
      console.error('Google OAuth verification error:', error);
      throw new UnauthorizedException('Invalid or expired Google token');
    }
  }
}

