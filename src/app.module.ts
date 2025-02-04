import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarkModule } from './bookmark/bookmark.module';
import { StockModule } from './stock/stock.module';
import { ClusterModule } from './cluster/cluster.module';

@Module({
  imports: [
    AuthModule, 
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGODB_URI'), 
      }),
      inject: [ConfigService], 
    }), BookmarkModule, StockModule, ClusterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
