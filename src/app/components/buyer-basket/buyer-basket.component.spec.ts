import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BuyerBasketComponent } from './buyer-basket.component';

describe('BuyerBasketComponent', () => {
  let component: BuyerBasketComponent;
  let fixture: ComponentFixture<BuyerBasketComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerBasketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
