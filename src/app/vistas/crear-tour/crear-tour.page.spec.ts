import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearTourPage } from './crear-tour.page';

describe('CrearTourPage', () => {
  let component: CrearTourPage;
  let fixture: ComponentFixture<CrearTourPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTourPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
