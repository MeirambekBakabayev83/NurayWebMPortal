import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DedliveryAddressesComponent } from './dedlivery-addresses.component';

describe('DedliveryAddressesComponent', () => {
  let component: DedliveryAddressesComponent;
  let fixture: ComponentFixture<DedliveryAddressesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DedliveryAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DedliveryAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
