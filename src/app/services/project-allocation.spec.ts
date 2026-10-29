import { TestBed } from '@angular/core/testing';

import { ProjectAllocation } from './project-allocation';

describe('ProjectAllocation', () => {
  let service: ProjectAllocation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectAllocation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
