import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinturaEditorComponent } from './pintura-editor.component';

describe('PinturaEditorComponent', () => {
  let component: PinturaEditorComponent;
  let fixture: ComponentFixture<PinturaEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinturaEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PinturaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
