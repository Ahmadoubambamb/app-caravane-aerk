import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationReceipt } from '../../../models/reservation';

import { TicketConfirmation } from './ticket-confirmation';

describe('TicketConfirmation', () => {
  let component: TicketConfirmation;
  let fixture: ComponentFixture<TicketConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketConfirmation);
    component = fixture.componentInstance;
    const receipt: ReservationReceipt = {
      paymentMethod: 'WAVE',
      testMode: true,
      reservation: {
        id: 12,
        nom: 'Ndiaye',
        prenom: 'Awa',
        telephone: '770000000',
        numSiege: 4,
        moyenPaiement: 'WAVE',
        paiementTest: true,
        statutPaiement: 'VALIDE',
        bus: { id: 3, numeroBus: 1, capacite: 56, placesOccupees: 4, statut: 'OUVERT' },
      },
    };
    fixture.componentRef.setInput('receipt', receipt);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('AERK-0012');
    expect(fixture.nativeElement.textContent).toContain('Simulation de test');
    expect(fixture.nativeElement.textContent).toContain('billet non valable pour voyager');
    expect(fixture.nativeElement.textContent).not.toContain('TX-1234');
  });
});
