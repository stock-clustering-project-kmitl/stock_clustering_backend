import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './schema/user.chema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create-user')
  async createUser(@Body() request: CreateUserDto) {
    await this.userService.create(request)
  }

  @Get('/get-all-users')
  @UseGuards(JwtAuthGuard)
  async getUsers(@CurrentUser() user:User){
    return this.userService.getUsers()
  }
}
