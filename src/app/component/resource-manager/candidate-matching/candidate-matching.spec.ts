import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateMatching } from './candidate-matching';

describe('CandidateMatching', () => {
  let component: CandidateMatching;
  let fixture: ComponentFixture<CandidateMatching>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateMatching]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateMatching);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
