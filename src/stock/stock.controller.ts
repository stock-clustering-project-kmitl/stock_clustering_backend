import { Controller, Get, Post, Body, Patch, Param, Delete, Query ,UseGuards} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/user/schema/user.schema';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('name/:name')
  @UseGuards(JwtAuthGuard)
  findBySymbol(@Param('name') name: string, @CurrentUser() user: User) {
    return this.stockService.findBySymbol(name, user._id.toString());
  }

  @Get('year/:year')
  @UseGuards(JwtAuthGuard)
  findByYear(@Param('year') year: string) {
    return this.stockService.findByYear(+year);
  }

  @Get('search/:prefix')
  @UseGuards(JwtAuthGuard)
  searchByPrefix(@Param('prefix') prefix: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.stockService.searchByPrefix(prefix, limitNumber);
  }
}
