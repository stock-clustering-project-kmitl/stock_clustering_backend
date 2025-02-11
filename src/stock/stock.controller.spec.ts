import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

describe('StockController', () => {
  let controller: StockController;
  let service: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [StockService],
    }).compile();

    controller = module.get<StockController>(StockController);
    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return stock data for a given year', () => {
    const year = '2020';
    const result = { /* mock data */ };
    jest.spyOn(service, 'findByYear').mockImplementation(() => result);

    expect(controller.findByYear(year)).toBe(result);
  });

  it('should return stock names for a given prefix', () => {
    const prefix = 'A';
    const result = [ /* mock stock names */ ];
    jest.spyOn(service, 'searchByPrefix').mockImplementation(() => result);

    expect(controller.searchByPrefix(prefix)).toBe(result);
  });

  it('should return limited stock names for a given prefix', () => {
    const prefix = 'A';
    const limit = '5';
    const result = [ /* mock stock names */ ];
    jest.spyOn(service, 'searchByPrefix').mockImplementation(() => result.slice(0, parseInt(limit, 10)));

    expect(controller.searchByPrefix(prefix, limit)).toBe(result.slice(0, parseInt(limit, 10)));
  });
});
