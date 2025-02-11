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

  it('should return stock names for a given prefix', () => {
    const prefix = 'A';
    const result = [ /* mock stock names */ ];
    expect(service.searchByPrefix(prefix)).toEqual(result);
  });

  it('should return limited stock names for a given prefix', () => {
    const prefix = 'A';
    const limit = 5;
    const result = [ /* mock stock names */ ];
    expect(service.searchByPrefix(prefix, limit)).toEqual(result.slice(0, limit));
  });
});
