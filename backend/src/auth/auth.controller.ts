import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Body('ipAddress') ipAddress?: string) {
    return this.authService.login(req.user, ipAddress || req.ip);
  }

  @Public()
  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @Public()
  async logout(@Body('sessionId') sessionId: number) {
    await this.authService.logout(sessionId);
    return { message: 'Logged out successfully' };
  }
}
