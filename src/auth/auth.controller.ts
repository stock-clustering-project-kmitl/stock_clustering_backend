import { Controller, Post, Get, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/user/schema/user.schema';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) { 
    await this.authService.login(user,response)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@CurrentUser() user: User) {
    return { email: "user.email", username: user.username };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('Authentication', '', { expires: new Date(0) });
    response.sendStatus(200);
  }
}
