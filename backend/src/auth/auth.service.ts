import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserSessionService } from '../user-session/user-session.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private userSessionService: UserSessionService,
  ) {}

  async validateUser({ username, password }: { username: string; password: string }) {
    const user = await this.usersService.findOne(username, true);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    if (user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
      throw new UnauthorizedException(`Votre compte est ${user.accountStatus}. Connexion impossible.`);
    }

    delete user.password;
    return user;
  }

  async login(user: any, ipAddress: string) {
    const activeSessions = await this.userSessionService.findActiveSessionsByUserId(user.id);
    const MAX_SESSIONS = 3;

    if (activeSessions.length >= MAX_SESSIONS) {
      const sessionsToClose = activeSessions.length - (MAX_SESSIONS - 1);
      await Promise.all(
        activeSessions.slice(0, sessionsToClose).map(session => this.userSessionService.endSession(session.id))
      );
    }

    const session = await this.userSessionService.createSession({
      usermail: user.email,
      ipAddress,
      userId: user.id,
    });

    const payload = { username: user.username, sub: user.id, sessionId: session.id };

    // Générer access token (court) et refresh token (long)
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      sessionId: session.id,
    };
  }

  async logout(sessionId: number) {
    await this.userSessionService.endSession(sessionId);
    return { message: 'Logged out successfully' };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });

      const session = await this.userSessionService.getSessionById(payload.sessionId);
      if (!session || session.sessionEnd) {
        throw new UnauthorizedException('Session inactive ou expirée');
      }

      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.id, sessionId: session.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }
}
