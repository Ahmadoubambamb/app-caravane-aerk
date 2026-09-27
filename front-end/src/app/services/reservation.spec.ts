import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { Reservation } from './reservation';

describe('Reservation', () => {
  let service: Reservation;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(Reservation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
