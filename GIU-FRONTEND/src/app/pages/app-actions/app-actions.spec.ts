import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppActions } from './app-actions';

describe('AppActions', () => {
  let component: AppActions;
  let fixture: ComponentFixture<AppActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
