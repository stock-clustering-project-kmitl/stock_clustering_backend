import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import { Types } from 'mongoose';
import { StockService } from '../stock/stock.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel : Model<User>,
    @Inject(forwardRef(() => StockService))
    private readonly stockService: StockService,
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

  async addBookmarkToUser(userId: string, bookmarkId: Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { bookmarks: bookmarkId },
    });
  }

  async removeBookmarkFromUser(userId: string, bookmarkId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { bookmarks: bookmarkId },
    });
  }

  async addFavoriteStock(userId: string, stockName: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.favorite.includes(stockName)) {
        throw new Error('Stock is already in favorites');
      }

      user.favorite.push(stockName);
      await user.save();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to add favorite stock');
    }
  }

  async removeFavoriteStock(userId: string, stockName: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.favorite = user.favorite.filter(stock => stock !== stockName);
      await user.save();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to remove favorite stock');
    }
  }

  async getFavoriteStocks(userId: string, page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc') {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const favoriteStockNames = user.favorite.slice(startIndex, endIndex);
    const favoriteStocks = await Promise.all(
      favoriteStockNames.map(stockName => this.stockService.findBySymbol(stockName, userId, true))
    );

    favoriteStocks.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    return {
      total: user.favorite.length,
      page,
      limit,
      favoriteStocks,
    };
  }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserProfileDto.username) {
      user.username = updateUserProfileDto.username;
    }
    if (updateUserProfileDto.email) {
      user.email = updateUserProfileDto.email;
    }

    await user.save();
    return user;
  }

  async updateUserPassword(userId: string, updateUserPasswordDto: UpdateUserPasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const authenticated = await compare(updateUserPasswordDto.currentPassword, user.password);
    if (!authenticated) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await hash(updateUserPasswordDto.newPassword, 10);
    await user.save();
    return user;
  }

  async addStockToLastSearch(userId: string, stockName: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    user.lastStockSearch = user.lastStockSearch.filter(stock => stock !== stockName);
  
    user.lastStockSearch.unshift(stockName);
  
    if (user.lastStockSearch.length > 5) {
      user.lastStockSearch.pop();
    }
  
    await user.save();
    return user.lastStockSearch;
  }

  async addClusterParameter(userId: string, algorithm: string, parameter: object) {
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }

    // Initialize lastClusterParameterUsed if it doesn't exist
    if (!user.lastClusterParameterUsed) {
        user.lastClusterParameterUsed = new Map();
    }

    // Initialize the algorithm array if it doesn't exist
    if (!user.lastClusterParameterUsed.has(algorithm)) {
        user.lastClusterParameterUsed.set(algorithm, []);
    }

    // Get the parameters array for the algorithm
    const parameters = user.lastClusterParameterUsed.get(algorithm);

    // Filter out the existing parameter if it exists
    const filteredParameters = parameters.filter(param => JSON.stringify(param) !== JSON.stringify(parameter));

    // Add the new parameter to the beginning of the array
    filteredParameters.unshift(parameter);

    // Ensure only the last 5 parameters are kept
    if (filteredParameters.length > 5) {
        filteredParameters.pop();
    }

    // Update the map with the new parameters array
    user.lastClusterParameterUsed.set(algorithm, filteredParameters);

    // Ensure only the last 5 algorithms are kept
    if (user.lastClusterParameterUsed.size > 5) {
        const firstKey = user.lastClusterParameterUsed.keys().next().value;
        user.lastClusterParameterUsed.delete(firstKey);
    }

    await user.save();
    return user.lastClusterParameterUsed;
  }

  async getLastStockSearch(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.lastStockSearch;
  }
  
  async deleteStockFromLastSearch(userId: string, stockName: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.lastStockSearch = user.lastStockSearch.filter(stock => stock !== stockName);
    await user.save();
    return user.lastStockSearch;
  }
  
  async getLastClusterParameter(userId: string, algorithm: string) {
    console.log(algorithm)
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    console.log(user.lastClusterParameterUsed)
    return user.lastClusterParameterUsed?.get(algorithm) || [];
  }
  
  async deleteLastClusterParameter(userId: string, algorithm: string, parameterIndex: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.lastClusterParameterUsed || !user.lastClusterParameterUsed.has(algorithm)) {
      throw new NotFoundException('Algorithm parameters not found');
    }
    const parameters = user.lastClusterParameterUsed.get(algorithm);
    if (parameterIndex < 0 || parameterIndex >= parameters.length) {
      throw new NotFoundException('Parameter not found');
    }
    parameters.splice(parameterIndex, 1);
    user.lastClusterParameterUsed.set(algorithm, parameters);
    await user.save();
    return user.lastClusterParameterUsed.get(algorithm);
  }
}
