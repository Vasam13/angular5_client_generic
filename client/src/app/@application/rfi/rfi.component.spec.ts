import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RfiComponent } from './rfi.component';

describe('RfiComponent', () => {
  let component: RfiComponent;
  let fixture: ComponentFixture<RfiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RfiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RfiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
