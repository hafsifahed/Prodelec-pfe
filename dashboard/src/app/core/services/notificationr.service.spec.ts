import { TestBed } from '@angular/core/testing';

import { NotificationrService } from './notificationr.service';

describe('NotificationrService', () => {
  let service: NotificationrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
