import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryExploreComponent } from './category-explore.component';

describe('CategoryExploreComponent', () => {
  let component: CategoryExploreComponent;
  let fixture: ComponentFixture<CategoryExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryExploreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
