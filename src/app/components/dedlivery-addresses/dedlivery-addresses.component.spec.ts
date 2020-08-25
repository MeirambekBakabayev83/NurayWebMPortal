import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DedliveryAddressesComponent } from './dedlivery-addresses.component';

describe('DedliveryAddressesComponent', () => {
  let component: DedliveryAddressesComponent;
  let fixture: ComponentFixture<DedliveryAddressesComponent>;

  beforeEach(async(() => {
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
