import { Injectable, NotFoundException ,Inject,forwardRef} from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import * as fs from 'fs';
import * as path from 'path';
import { UserService } from 'src/user/user.service';

@Injectable()
export class StockService {

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  findAll() {
    return `This action returns all stock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stock`;
  }

  async findBySymbol(symbol: string, userId: string) {
    const filePath = path.join(__dirname, '../../../DATASET/RawData', `2020.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const stocks = JSON.parse(data);
      const stock = stocks.find((stock: any) => stock.symbol === symbol);
      if (stock) {
        await this.userService.addStockToLastSearch(userId, symbol);
        return stock;
      } else {
        throw new NotFoundException(`Stock with symbol ${symbol} not found`);
      }
    } else {
      throw new NotFoundException(`Stock data not found`);
    }
  }

  findByYear(year: number) {
    const filePath = path.join(__dirname, '../../../DATASET/RawData', `${year}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } else {
      throw new Error(`Data for year ${year} not found`);
    }
  }

  searchByPrefix(prefix: string, limit?: number) {
    const filePath = path.join(__dirname, '../../../DATASET/RawData', `2020.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const stocks = JSON.parse(data);
      let filteredStocks = stocks
        .filter((stock: any) => stock.symbol.startsWith(prefix))
        .map((stock: any) => stock.symbol);
      if (limit) {
        filteredStocks = filteredStocks.slice(0, limit);
      }
      return filteredStocks;
    } else {
      throw new Error(`Stock data not found`);
    }
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
