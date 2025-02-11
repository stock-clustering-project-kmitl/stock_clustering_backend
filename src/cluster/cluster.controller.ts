import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { ClusterService } from './cluster.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/schema/user.schema';



@Controller('cluster')
export class ClusterController {
  constructor(private readonly clusterService: ClusterService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async callGetClusterApi(@Body() data: any, @CurrentUser() user: User) {
    return this.clusterService.callGetClusterApi(data, user);
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
