import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Get('search/:prefix')
  searchByPrefix(@Param('prefix') prefix: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.stockService.searchByPrefix(prefix, limitNumber);
  }
}
