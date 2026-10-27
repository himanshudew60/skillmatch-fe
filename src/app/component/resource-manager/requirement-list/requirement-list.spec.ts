import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementList } from './requirement-list';

describe('RequirementList', () => {
  let component: RequirementList;
  let fixture: ComponentFixture<RequirementList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
