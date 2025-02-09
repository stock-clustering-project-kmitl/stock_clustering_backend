import { Injectable } from '@nestjs/common';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';
import axios from 'axios';

@Injectable()
export class ClusterService {
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

  async callGetClusterApi(data: any) {
    try {
      const response = await axios.post('http://localhost:5000/cluster', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error calling Flask API: ${error.message}`);
    }
  }

  async callGetNearestStockApi(data: any) {
    try {
      const response = await axios.post('http://localhost:5000/nearest_stocks', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error calling Flask API: ${error.message}`);
    }
  }
}
