import { TestBed } from '@angular/core/testing';

import { WorkerSessionService } from './worker-session.service';

describe('WorkerSessionService', () => {
  let service: WorkerSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
