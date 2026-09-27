import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminLogin } from './admin-login';

describe('AdminLogin', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLogin],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('opens the dashboard only after the backend accepts the credentials', () => {
    const fixture = TestBed.createComponent(AdminLogin);
    const http = TestBed.inject(HttpTestingController);
    const component = fixture.componentInstance;
    let authenticated = false;
    component.authenticated.subscribe(() => {
      authenticated = true;
    });
    component.credentials = { username: 'admin', password: 'secret' };

    component.login();

    const request = http.expectOne('http://localhost:8080/api/admin/auth-check');
    expect(authenticated).toBe(false);
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(authenticated).toBe(true);
    http.verify();
  });
});
