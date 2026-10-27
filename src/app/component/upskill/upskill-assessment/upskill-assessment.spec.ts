import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpskillAssessment } from './upskill-assessment';

describe('UpskillAssessment', () => {
  let component: UpskillAssessment;
  let fixture: ComponentFixture<UpskillAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpskillAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpskillAssessment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
