import { forwardRef, Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
