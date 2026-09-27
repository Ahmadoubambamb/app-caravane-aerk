import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reservation as ReservationService } from '../../../services/reservation';
import { PaymentMethod, PaymentMode, ReservationReceipt } from '../../../models/reservation';

@Component({
  selector: 'app-reservation-form',
  imports: [FormsModule],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css',
})
export class ReservationForm implements OnInit {
  private readonly reservationService = inject(ReservationService);
  readonly completed = output<ReservationReceipt>();
  readonly cancel = output<void>();
  readonly step = signal<'details' | 'payment'>('details');
  readonly paymentMethod = signal<PaymentMethod | null>('WAVE');
  readonly loading = signal(false);
  readonly paymentMode = signal<PaymentMode>('unavailable');
  readonly modeLoading = signal(true);
  readonly modeError = signal('');
  readonly error = signal('');
  readonly methods: { id: PaymentMethod; name: string; short: string }[] = [
    { id: 'WAVE', name: 'Wave', short: 'W' },
  ];

  form = { nom: '', prenom: '', telephone: '' };

  ngOnInit(): void {
    this.reservationService.getPaymentMode().subscribe({
      next: (response) => {
        this.paymentMode.set(response.mode);
        this.modeLoading.set(false);
      },
      error: (error: unknown) => {
        this.paymentMode.set('unavailable');
        this.modeLoading.set(false);
        const response = error instanceof HttpErrorResponse ? error.error : null;
        const message = typeof response === 'string' ? response : response?.message;
        this.modeError.set(
          typeof message === 'string'
            ? message
            : 'Impossible de vérifier le paiement. Vérifie que le backend est disponible.',
        );
      },
    });
  }

  continueToPayment(): void {
    this.error.set('');
    this.step.set('payment');
  }

  backToDetails(): void {
    this.error.set('');
    this.step.set('details');
  }

  submitReservation(): void {
    const method = this.paymentMethod();
    if (!method) {
      this.error.set('Choisis Wave pour continuer.');
      return;
    }
    if (this.paymentMode() === 'unavailable') {
      this.error.set('Le paiement Wave n’est pas encore configuré sur ce serveur.');
      return;
    }

    const payload = {
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      telephone: this.form.telephone.trim(),
    };

    this.loading.set(true);
    this.error.set('');
    if (this.paymentMode() === 'wave') {
      this.reservationService.createWaveCheckout(payload).subscribe({
        next: (result) => {
          this.loading.set(false);
          window.location.assign(result.checkoutUrl);
        },
        error: (error: unknown) => this.handlePaymentError(error),
      });
      return;
    }

    this.reservationService.simulatePayment(payload, method).subscribe({
      next: (reservation) => {
        this.loading.set(false);
        this.completed.emit({ reservation, paymentMethod: method, testMode: true });
      },
      error: (error: unknown) => this.handlePaymentError(error),
    });
  }

  private handlePaymentError(error: unknown): void {
    const response = error instanceof HttpErrorResponse ? error.error : null;
    const message = typeof response === 'string' ? response : response?.message;
    this.error.set(typeof message === 'string' ? message : 'Le paiement n’a pas pu être démarré.');
    this.loading.set(false);
  }
}
