import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateReview } from './candidate-review';

describe('CandidateReview', () => {
  let component: CandidateReview;
  let fixture: ComponentFixture<CandidateReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
