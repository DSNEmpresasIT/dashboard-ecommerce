import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletCheckComponent } from './delet-check.component';

describe('DeletCheckComponent', () => {
  let component: DeletCheckComponent;
  let fixture: ComponentFixture<DeletCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeletCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
