import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
  });

  it('authenticates with the backend and keeps the credential in memory', () => {
    const http = TestBed.inject(HttpTestingController);
    let completed = false;

    service.login('admin', 'secret').subscribe(() => {
      completed = true;
    });

    const request = http.expectOne('http://localhost:8080/api/admin/auth-check');
    expect(request.request.headers.get('Authorization')).toMatch(/^Basic /);
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(service).toBeTruthy();
    expect(completed).toBe(true);
    expect(service.isAuthenticated).toBe(true);
    expect(service.authorization).toMatch(/^Basic /);
    service.logout();
    expect(service.isAuthenticated).toBe(false);
    http.verify();
  });
});
