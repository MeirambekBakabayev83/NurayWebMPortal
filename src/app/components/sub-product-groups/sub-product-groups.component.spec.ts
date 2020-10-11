import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubProductGroupsComponent } from './sub-product-groups.component';

describe('SubProductGroupsComponent', () => {
  let component: SubProductGroupsComponent;
  let fixture: ComponentFixture<SubProductGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubProductGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubProductGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
