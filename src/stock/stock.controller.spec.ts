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
});
