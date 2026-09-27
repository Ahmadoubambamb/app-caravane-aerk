import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { Caravane } from './caravane';

describe('Caravane', () => {
  let service: Caravane;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(Caravane);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
