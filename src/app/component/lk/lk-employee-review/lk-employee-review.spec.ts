import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LkEmployeeReview } from './lk-employee-review';

describe('LkEmployeeReview', () => {
  let component: LkEmployeeReview;
  let fixture: ComponentFixture<LkEmployeeReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LkEmployeeReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LkEmployeeReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
