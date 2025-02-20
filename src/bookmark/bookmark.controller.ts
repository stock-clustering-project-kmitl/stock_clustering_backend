import { BookmarkService } from './bookmark.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/schema/user.schema';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createBookmark(@Body() createBookmarkDto: CreateBookmarkDto, @CurrentUser() user: User) {
      return this.bookmarkService.create(createBookmarkDto, user);
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard)
  async getBookmarks(@CurrentUser() user: User) {
    return this.bookmarkService.findByUser(user);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateBookmark(@Param('id') bookmarkId: string, @Body() updateBookmarkDto: UpdateBookmarkDto, @CurrentUser() user: User) {
    return this.bookmarkService.update(bookmarkId, updateBookmarkDto, user);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBookmark(@Param('id') bookmarkId: string, @CurrentUser() user: User) {
    await this.bookmarkService.delete(bookmarkId, user);
    return { message: 'Bookmark deleted successfully' };
  }
}
