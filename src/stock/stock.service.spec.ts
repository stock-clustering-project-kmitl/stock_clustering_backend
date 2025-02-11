import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';

describe('StockService', () => {
  let service: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockService],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return stock data for a given year', () => {
    const year = 2020;
    const result = { /* mock data */ };
    expect(service.findByYear(year)).toEqual(result);
  });
});
