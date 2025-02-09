import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClusterService } from './cluster.service';


@Controller('cluster')
export class ClusterController {
  constructor(private readonly clusterService: ClusterService) {}

  @Post()
  async callGetClusterApi(@Body() data: any) {
    return this.clusterService.callGetClusterApi(data);
  }
  @Get()
  findAll() {
    return this.clusterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clusterService.findOne(+id);
  }

  @Post('nearest_stocks')
  async callGetNearestStockApi(@Body() data: any) {
    return this.clusterService.callGetNearestStockApi(data);
  }
}
