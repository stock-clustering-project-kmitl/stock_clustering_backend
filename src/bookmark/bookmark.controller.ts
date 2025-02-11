import { BookmarkService } from './bookmark.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/schema/user.schema';

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

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBookmark(@Param('id') bookmarkId: string, @CurrentUser() user: User) {
    await this.bookmarkService.delete(bookmarkId, user);
    return { message: 'Bookmark deleted successfully' };
  }
}
