import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';

describe('BookmarkController', () => {
  let controller: BookmarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [BookmarkService],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update a bookmark', async () => {
    const result = { /* mock updated bookmark */ };
    jest.spyOn(service, 'update').mockImplementation(async () => result);

    expect(await controller.updateBookmark('bookmarkId', { /* mock update DTO */ }, { /* mock user */ })).toBe(result);
  });
});
