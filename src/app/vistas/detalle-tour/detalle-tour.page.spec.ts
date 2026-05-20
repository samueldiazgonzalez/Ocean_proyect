import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleTourPage } from './detalle-tour.page';

describe('DetalleTourPage', () => {
  let component: DetalleTourPage;
  let fixture: ComponentFixture<DetalleTourPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleTourPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
