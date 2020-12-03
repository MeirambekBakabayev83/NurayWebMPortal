import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BuyerRegistrationComponent } from './buyer-registration.component';

describe('BuyerRegistrationComponent', () => {
  let component: BuyerRegistrationComponent;
  let fixture: ComponentFixture<BuyerRegistrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
