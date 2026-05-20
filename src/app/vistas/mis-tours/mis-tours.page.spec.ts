import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisToursPage } from './mis-tours.page';

describe('MisToursPage', () => {
  let component: MisToursPage;
  let fixture: ComponentFixture<MisToursPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisToursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
