import { TestBed } from '@angular/core/testing';

import { ResourceManager } from './resource-manager';

describe('ResourceManager', () => {
  let service: ResourceManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
