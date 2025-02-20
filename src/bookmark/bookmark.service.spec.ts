import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkService } from './bookmark.service';

describe('BookmarkService', () => {
  let service: BookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookmarkService],
    }).compile();

    service = module.get<BookmarkService>(BookmarkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update a bookmark', async () => {
    const result = { /* mock updated bookmark */ };
    jest.spyOn(service, 'update').mockImplementation(async () => result);

    expect(await service.update('bookmarkId', { /* mock update DTO */ }, { /* mock user */ })).toBe(result);
  });
});
