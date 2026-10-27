import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LkEmployeeList } from './lk-employee-list';

describe('LkEmployeeList', () => {
  let component: LkEmployeeList;
  let fixture: ComponentFixture<LkEmployeeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LkEmployeeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LkEmployeeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
