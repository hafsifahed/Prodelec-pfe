import { Test, TestingModule } from '@nestjs/testing';
import { CahierDesChargesController } from './cahier-des-charges.controller';
import { CahierDesChargesService } from './cahier-des-charges.service';

describe('CahierDesChargesController', () => {
  let controller: CahierDesChargesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CahierDesChargesController],
      providers: [CahierDesChargesService],
    }).compile();

    controller = module.get<CahierDesChargesController>(CahierDesChargesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
