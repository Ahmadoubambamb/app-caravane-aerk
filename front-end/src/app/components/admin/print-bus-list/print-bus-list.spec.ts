import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintBusList } from './print-bus-list';

describe('PrintBusList', () => {
  let component: PrintBusList;
  let fixture: ComponentFixture<PrintBusList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintBusList],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintBusList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
