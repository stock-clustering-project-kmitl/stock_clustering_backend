import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';
import axios from 'axios';

import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class ClusterService {

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  create(createClusterDto: CreateClusterDto) {
    return 'This action adds a new cluster';
  }

  findAll() {
    return `This action returns all cluster`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cluster`;
  }

  update(id: number, updateClusterDto: UpdateClusterDto) {
    return `This action updates a #${id} cluster`;
  }

  remove(id: number) {
    return `This action removes a #${id} cluster`;
  }

  async callGetClusterApi(data: any, user: User) {
    try {
      const response = await axios.post(`${process.env.FLASK_URL}/cluster`, data);
      if (data.params) {
        await this.userService.addClusterParameter(user._id.toString(), data.algorithm, data.params);
      }
      // Changed: Always return the full JSON response
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(
          error.response.data || { message: error.message },
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException({ message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async callGetNearestStockApi(data: any) {
    try {
      const response = await axios.post(`${process.env.FLASK_URL}/nearest_stocks`, data);
      // Changed: Always return the full JSON response
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(
          error.response.data || { message: error.message },
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException({ message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
