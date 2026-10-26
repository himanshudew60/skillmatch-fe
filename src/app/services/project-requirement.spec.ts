import { TestBed } from '@angular/core/testing';

import { ProjectRequirement } from './project-requirement';

describe('ProjectRequirement', () => {
  let service: ProjectRequirement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectRequirement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
