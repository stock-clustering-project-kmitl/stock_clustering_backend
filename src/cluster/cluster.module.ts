import { Module } from '@nestjs/common';
import { ClusterService } from './cluster.service';
import { ClusterController } from './cluster.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ClusterController],
  providers: [ClusterService],
})
export class ClusterModule {}
