import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisFavoritosPage } from './mis-favoritos.page';

describe('MisFavoritosPage', () => {
  let component: MisFavoritosPage;
  let fixture: ComponentFixture<MisFavoritosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisFavoritosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
