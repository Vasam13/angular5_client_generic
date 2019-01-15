import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDrawingsComponent } from './contract-drawings.component';

describe('ContractDrawingsComponent', () => {
  let component: ContractDrawingsComponent;
  let fixture: ComponentFixture<ContractDrawingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractDrawingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractDrawingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
