import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, InternalServerErrorException, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './schema/user.schema';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

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

  @Patch('/add-favorite-stock')
  @UseGuards(JwtAuthGuard)
  async addFavoriteStock(@CurrentUser() user: User, @Body('stockName') stockName: string) {
    try {
      return await this.userService.addFavoriteStock(user._id.toString(), stockName);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to add favorite stock');
    }
  }

  @Patch('/remove-favorite-stock')
  @UseGuards(JwtAuthGuard)
  async removeFavoriteStock(@CurrentUser() user: User, @Body('stockName') stockName: string) {
    try {
      return await this.userService.removeFavoriteStock(user._id.toString(), stockName);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to remove favorite stock');
    }
  }

  @Get('/favorite-stocks')
  @UseGuards(JwtAuthGuard)
  async getFavoriteStocks(
    @CurrentUser() user: User,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc'
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const sortField = sortBy || 'name'; // default sort field
    const sortDirection = sortOrder || 'asc'; // default sort order
    return this.userService.getFavoriteStocks(user._id.toString(), pageNumber, limitNumber, sortField, sortDirection);
  }

  @Patch('/update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: User, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.userService.updateUserProfile(user._id.toString(), updateUserProfileDto);
  }

  @Patch('/update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@CurrentUser() user: User, @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
    return this.userService.updateUserPassword(user._id.toString(), updateUserPasswordDto);
  }
}
