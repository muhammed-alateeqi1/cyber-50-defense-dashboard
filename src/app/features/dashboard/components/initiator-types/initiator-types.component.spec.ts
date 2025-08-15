import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiatorTypesComponent } from './initiator-types.component';

describe('InitiatorTypesComponent', () => {
  let component: InitiatorTypesComponent;
  let fixture: ComponentFixture<InitiatorTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitiatorTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitiatorTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
