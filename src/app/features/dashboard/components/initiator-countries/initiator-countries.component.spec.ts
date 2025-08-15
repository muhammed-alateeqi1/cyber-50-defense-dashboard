import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiatorCountriesComponent } from './initiator-countries.component';

describe('InitiatorCountriesComponent', () => {
  let component: InitiatorCountriesComponent;
  let fixture: ComponentFixture<InitiatorCountriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitiatorCountriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitiatorCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
