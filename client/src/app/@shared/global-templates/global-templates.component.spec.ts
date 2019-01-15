import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalTemplatesComponent } from './global-templates.component';

describe('GlobalTemplatesComponent', () => {
  let component: GlobalTemplatesComponent;
  let fixture: ComponentFixture<GlobalTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
