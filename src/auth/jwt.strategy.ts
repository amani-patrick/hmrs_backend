import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  // The 'validate' method is called after the token is verified
  validate(payload: JwtPayload): JwtPayload {
    if (!payload.userId || !payload.email) {
      throw new UnauthorizedException('Invalid token payload.');
    }
    
    // Additional validation can be added here (e.g., check if user still exists, is active, etc.)
    return payload; 
  }
}