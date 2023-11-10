import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSpinerComponent } from './button-spiner.component';

describe('ButtonSpinerComponent', () => {
  let component: ButtonSpinerComponent;
  let fixture: ComponentFixture<ButtonSpinerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonSpinerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ButtonSpinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
