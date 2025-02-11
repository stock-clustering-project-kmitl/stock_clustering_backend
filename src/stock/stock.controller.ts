import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('name/:name')
  findBySymbol(@Param('name') name: string) {
    return this.stockService.findBySymbol(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @Get('year/:year')
  findByYear(@Param('year') year: string) {
    return this.stockService.findByYear(+year);
  }
}
