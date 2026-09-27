import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should render the caravan home screen', () => {
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/api/public/caravane-statut').flush(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Kaolack');
    expect(fixture.nativeElement.textContent).toContain('Réservations bientôt ouvertes');
    http.verify();
  });

  it('should keep administration out of public navigation and show a login on the hidden entry', () => {
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/api/public/caravane-statut').flush(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.main-nav')?.textContent).not.toContain('Administration');

    fixture.componentInstance.openAdminLogin();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Se connecter');
    expect(fixture.nativeElement.textContent).not.toContain('Gérer les inscriptions');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    http.verify();
  });
});
