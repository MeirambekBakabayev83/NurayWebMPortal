import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LeftNavMenuComponent } from './left-nav-menu.component';

describe('LeftNavMenuComponent', () => {
  let component: LeftNavMenuComponent;
  let fixture: ComponentFixture<LeftNavMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftNavMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
