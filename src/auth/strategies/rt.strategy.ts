import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  email: string;
  [key: string]: any;
}

interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class RfStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private readonly configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true, // what allows us to access the request object in the validate method
    };
    super(options);
    console.log('RfStrategy constructor completed');
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new Error('No refresh token provided');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    if (!refreshToken) {
      throw new Error('Invalid refresh token format');
    }
    return {
      ...payload, // attach request.user = payload;
      refreshToken,
    };
  }
}
