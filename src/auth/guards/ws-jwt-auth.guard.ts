import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromSocket(client);
    
    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload?.sub) {
        throw new WsException('Invalid token');
      }

      // Attach user to the socket for future reference
      client.data.userId = payload.sub;
      client.data.tenantId = payload.tenantId;
      
      return true;
    } catch (error) {
      throw new WsException('Unauthorized: Invalid token');
    }
  }

  private extractTokenFromSocket(socket: Socket): string | null {
    // Try to get token from handshake auth first
    if (socket.handshake.auth?.token) {
      return socket.handshake.auth.token;
    }
    
    // Fallback to Authorization header
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    
    return null;
  }
}
