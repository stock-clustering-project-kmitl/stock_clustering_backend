import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bookmark } from './schema/bookmarkschema';
import { Model } from 'mongoose';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Injectable()
export class BookmarkService {

  constructor(
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    private readonly userService: UserService,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto, user: User): Promise<Bookmark> {
    const bookmarkCount = await this.bookmarkModel.countDocuments({
      userId: user._id,
      algorithmName: createBookmarkDto.algorithmName,
    });
    const bookmarkName = `B${bookmarkCount + 1}`;

    const newBookmark = new this.bookmarkModel({
      ...createBookmarkDto,
      userId: user._id,
      bookmarkName,
    });

    const savedBookmark = await newBookmark.save();
    await this.userService.updateBookmark(user._id.toString(), savedBookmark._id);

    return newBookmark;
  }

  async delete(bookmarkId: string, user: User): Promise<void> {
    const bookmark = await this.bookmarkModel.findById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (bookmark.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException('You do not have permission to delete this bookmark');
    }

    await this.bookmarkModel.findByIdAndDelete(bookmarkId);
    await this.userService.removeBookmarkFromUser(user._id.toString(), bookmarkId);
  }

  async update(bookmarkId: string, updateBookmarkDto: UpdateBookmarkDto, user: User): Promise<Bookmark> {
    const bookmark = await this.bookmarkModel.findById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (bookmark.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException('You do not have permission to update this bookmark');
    }

    Object.assign(bookmark, updateBookmarkDto);
    return bookmark.save();
  }

  async findByUser(user: User): Promise<Bookmark[]> {
    return this.bookmarkModel.find({ userId: user._id }).exec();
  }

}

