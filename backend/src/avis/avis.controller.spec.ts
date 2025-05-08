import { Test, TestingModule } from '@nestjs/testing';
import { AvisController } from './avis.controller';
import { AvisService } from './avis.service';

describe('AvisController', () => {
  let controller: AvisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvisController],
      providers: [AvisService],
    }).compile();

    controller = module.get<AvisController>(AvisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
