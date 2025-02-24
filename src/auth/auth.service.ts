import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs'
import { Response } from 'express';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from './token-payload-interface';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login(user: User,response: Response){
    const expiresAccessToken = new Date()
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() + 
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS'
        )
      )
    )

    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    }

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`, 
    });
    

    response.cookie('Authentication', accessToken,{
      httpOnly: true,
      secure: true,
      expires: expiresAccessToken,
      sameSite: 'none',
    })
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException('Invalid credentials provided.');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials provided.');
    }
  }
}
