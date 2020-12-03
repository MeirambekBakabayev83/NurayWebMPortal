import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerSettingsComponent } from './buyer-settings.component';

describe('BuyerSettingsComponent', () => {
  let component: BuyerSettingsComponent;
  let fixture: ComponentFixture<BuyerSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
