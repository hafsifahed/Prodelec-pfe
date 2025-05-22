// auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserSessionService } from '../user-session/user-session.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private userSessionService: UserSessionService,
  ) {}

  async validateUser({ username, password }: LoginDto) {
    const user = await this.usersService.findOne(username, true);
    if (!user) return null;

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Vérification du statut du compte
    if (user.accountStatus === 'inactive' || user.accountStatus === 'suspended') {
      throw new UnauthorizedException(`Votre compte est ${user.accountStatus}. Connexion impossible.`);
    }

    delete user.password;
    return user;
  }

  async login(user: any, ipAddress: string) {
    // Vérifier le nombre de sessions actives
    const activeSessions = await this.userSessionService.countActiveSessionsByUserId(user.id);
    console.log("count session : "+ activeSessions);
    if (activeSessions >= 3) {
      throw new BadRequestException('Vous êtes déjà connecté sur deux sessions. Veuillez vous déconnecter avant de vous reconnecter.');
    }

    // Créer une nouvelle session
    const session = await this.userSessionService.createSession({
      usermail: user.email,
      ipAddress,
      userId: user.id,
    });

    const payload = { username: user.username, sub: user.id, sessionId: session.id };
    return {
      access_token: this.jwtService.sign(payload),
      sessionId: session.id,
    };
  }

  async logout(sessionId: number) {
    await this.userSessionService.endSession(sessionId);
    return { message: 'Logged out successfully' };
  }
}