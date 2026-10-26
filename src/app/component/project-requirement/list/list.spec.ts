import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRequirementListComponent } from './list';

describe('List', () => {
  let component: ProjectRequirementListComponent;
  let fixture: ComponentFixture<ProjectRequirementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRequirementListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectRequirementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
