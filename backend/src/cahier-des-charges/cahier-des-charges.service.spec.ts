import { Test, TestingModule } from '@nestjs/testing';
import { CahierDesChargesService } from './cahier-des-charges.service';

describe('CahierDesChargesService', () => {
  let service: CahierDesChargesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CahierDesChargesService],
    }).compile();

    service = module.get<CahierDesChargesService>(CahierDesChargesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
