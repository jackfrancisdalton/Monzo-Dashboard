import { Test, TestingModule } from '@nestjs/testing';
import { MonzoService } from './mock-monzo.service';

describe('MonzoService', () => {
  let service: MonzoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonzoService],
    }).compile();

    service = module.get<MonzoService>(MonzoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
