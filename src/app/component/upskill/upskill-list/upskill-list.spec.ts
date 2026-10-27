import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpskillList } from './upskill-list';

describe('UpskillList', () => {
  let component: UpskillList;
  let fixture: ComponentFixture<UpskillList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpskillList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpskillList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
