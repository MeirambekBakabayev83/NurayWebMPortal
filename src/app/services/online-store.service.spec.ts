import { TestBed } from '@angular/core/testing';

import { OnlineStoreService } from './online-store.service';

describe('OnlineStoreService', () => {
  let service: OnlineStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
