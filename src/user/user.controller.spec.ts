import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated favorite stocks', async () => {
    const userId = 'someUserId';
    const page = '1';
    const limit = '10';
    const result = {
      total: 20,
      page: 1,
      limit: 10,
      favoriteStocks: [ /* mock favorite stocks */ ],
    };

    jest.spyOn(service, 'getFavoriteStocks').mockImplementation(async () => result);

    expect(await controller.getFavoriteStocks({ _id: userId } as any, page, limit)).toBe(result);
  });

  it('should return sorted paginated favorite stocks', async () => {
    const userId = 'someUserId';
    const page = '1';
    const limit = '10';
    const sortBy = 'price';
    const sortOrder = 'asc';
    const result = {
      total: 20,
      page: 1,
      limit: 10,
      favoriteStocks: [ /* mock favorite stocks */ ],
    };

    jest.spyOn(service, 'getFavoriteStocks').mockImplementation(async () => result);

    expect(await controller.getFavoriteStocks({ _id: userId } as any, page, limit, sortBy, sortOrder)).toBe(result);
  });
});
