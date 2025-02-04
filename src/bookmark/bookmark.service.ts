import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bookmark } from './schema/bookmarkschema';
import { Model } from 'mongoose';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { User } from 'src/user/schema/user.chema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BookmarkService {

  constructor(
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    private readonly userService: UserService,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto, user: User): Promise<Bookmark> {
    const newBookmark = new this.bookmarkModel({
      ...createBookmarkDto,
      userId: user._id,
      }
    );
    const savedBookmark = await newBookmark.save();
    await this.userService.updateBookmark(user._id.toString(), savedBookmark._id);
    return newBookmark;
  }


}

