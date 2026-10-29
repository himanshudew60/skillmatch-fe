import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAllocationList } from './project-allocation-list';

describe('ProjectAllocationList', () => {
  let component: ProjectAllocationList;
  let fixture: ComponentFixture<ProjectAllocationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAllocationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAllocationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
