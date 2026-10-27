import { TestBed } from '@angular/core/testing';

import { Lk } from './lk';

describe('Lk', () => {
  let service: Lk;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lk);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
