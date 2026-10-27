import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementDetails } from './requirement-details';

describe('RequirementDetails', () => {
  let component: RequirementDetails;
  let fixture: ComponentFixture<RequirementDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
