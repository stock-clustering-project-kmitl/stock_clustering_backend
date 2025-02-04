import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.chema';
import { FilterQuery, Model } from 'mongoose';
import { hash } from 'bcryptjs';
import { Types } from 'mongoose';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel : Model<User>
  ) {}

  async create(data: CreateUserDto) {
    await new this.userModel({ 
      ...data,
      password: await hash(data.password, 10)
     }).save();
  }

  async getUser(query: FilterQuery<User>){
    const user = (await this.userModel.findOne(query)).toObject();
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async getUsers(){
    return this.userModel.find({})
  }

  async updateBookmark(userId: string, bookmarkId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    user.bookmarks.push(bookmarkId);
    await user.save();
  }
}
