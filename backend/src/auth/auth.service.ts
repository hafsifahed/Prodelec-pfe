import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserSessionService } from '../user-session/user-session.service';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  sessionId: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userSessionService: UserSessionService,
  ) {}

  /** Valide l'utilisateur et retourne ses données sans le mot de passe */
  async validateUser(credentials: { username: string; password: string }): Promise<Omit<User, 'password'> | null> {
    const { username, password } = credentials;
    // Charge l'utilisateur avec le mot de passe et relations nécessaires (partner, role)
    const user = await this.usersService.findOne(username, true);
    if (!user) return null;

    // Vérifie le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Vérifie le statut du compte
    if (user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
      throw new UnauthorizedException(`Votre compte est ${user.accountStatus}. Connexion impossible.`);
    }

    // Supprime le mot de passe avant de retourner l'utilisateur
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /** Crée une session, limite le nombre de sessions actives, et génère tokens JWT */
  async login(user: User, ipAddress: string): Promise<LoginResponse> {
    const activeSessions = await this.userSessionService.findActiveSessionsByUserId(user.id);
    const MAX_SESSIONS = 3;

    // Ferme les sessions les plus anciennes si trop de sessions actives
    const sessionsToClose = Math.max(0, activeSessions.length - (MAX_SESSIONS - 1));
    if (sessionsToClose > 0) {
      await Promise.all(
        activeSessions.slice(0, sessionsToClose).map(session => this.userSessionService.endSession(session.id)),
      );
    }

    // Crée une nouvelle session
    const session = await this.userSessionService.createSession({
      usermail: user.email,
      ipAddress,
      userId: user.id,
    });

    // Prépare le payload JWT
    const payload = { username: user.username, sub: user.id, sessionId: session.id };

    // Génère access token et refresh token
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '2h',
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

  /** Termine une session */
  async logout(sessionId: number) {
    await this.userSessionService.endSession(sessionId);
    return { message: 'Logged out successfully' };
  }

  /** Rafraîchit le token d'accès à partir du refresh token */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Vérifie et décode le refresh token
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });

      // Vérifie que la session est toujours active
      const session = await this.userSessionService.getSessionById(payload.sessionId);
      if (!session || session.sessionEnd) {
        throw new UnauthorizedException('Session inactive ou expirée');
      }

      // Récupère l'utilisateur lié à la session
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      // Génère un nouveau access token
      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.id, sessionId: session.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '2h' },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }
}
