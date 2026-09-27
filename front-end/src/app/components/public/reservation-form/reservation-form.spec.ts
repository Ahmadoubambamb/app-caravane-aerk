import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ReservationForm } from './reservation-form';

describe('ReservationForm', () => {
  let component: ReservationForm;
  let fixture: ComponentFixture<ReservationForm>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationForm);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/api/public/paiements/mode').flush({ mode: 'test' });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    http.verify();
  });

  it('simulates a selected payment without requesting a transaction reference', () => {
    component.form = { nom: 'Ndiaye', prenom: 'Awa', telephone: '770000000' };
    component.paymentMethod.set('WAVE');
    component.continueToPayment();
    let receipt: unknown;
    component.completed.subscribe((value) => {
      receipt = value;
    });

    component.submitReservation();

    const request = http.expectOne('http://localhost:8080/api/public/paiements/simuler');
    expect(request.request.body).toEqual({
      nom: 'Ndiaye',
      prenom: 'Awa',
      telephone: '770000000',
      moyenPaiement: 'WAVE',
    });
    expect(request.request.body).not.toHaveProperty('referencePaiement');
    request.flush({
      id: 12,
      nom: 'Ndiaye',
      prenom: 'Awa',
      telephone: '770000000',
      numSiege: 4,
      moyenPaiement: 'WAVE',
      paiementTest: true,
      statutPaiement: 'VALIDE',
      bus: { id: 3, numeroBus: 1, capacite: 56, placesOccupees: 4, statut: 'OUVERT' },
    });

    expect(receipt).toEqual(
      expect.objectContaining({ paymentMethod: 'WAVE', testMode: true }),
    );
    http.verify();
  });
});
