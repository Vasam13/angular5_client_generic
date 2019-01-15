import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BfaComponent } from './bfa.component';

describe('BfaComponent', () => {
  let component: BfaComponent;
  let fixture: ComponentFixture<BfaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BfaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
