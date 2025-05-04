import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.username, false); // load role relation
  
    if (!user) {
      throw new UnauthorizedException();
    }
  
    if (user.accountStatus !== 'active') {
      throw new UnauthorizedException(
        `${user.username}, account ${user.accountStatus}`,
      );
    }
  
    // Return user info with role and permissions
    return {
      userId: user.id,
      username: user.username,
      role: user.role, // role with permissions JSON
    };
  }
  
}
