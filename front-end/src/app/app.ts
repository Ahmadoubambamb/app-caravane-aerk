import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { EMPTY, expand, last, switchMap, take, timer } from 'rxjs';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { AdminLogin } from './components/admin/admin-login/admin-login';
import { ReservationForm } from './components/public/reservation-form/reservation-form';
import { TicketConfirmation } from './components/public/ticket-confirmation/ticket-confirmation';
import { Auth } from './core/services/auth';
import { CaravaneSession } from './models/caravane-session';
import { ReservationReceipt } from './models/reservation';
import { Caravane } from './services/caravane';
import { Reservation } from './services/reservation';

@Component({
  selector: 'app-root',
  imports: [AdminDashboard, AdminLogin, ReservationForm, TicketConfirmation],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly caravane = inject(Caravane);
  readonly page = signal<'home' | 'reservation' | 'ticket' | 'payment-return' | 'admin-login' | 'admin'>('home');
  readonly session = signal<CaravaneSession | null>(null);
  readonly receipt = signal<ReservationReceipt | null>(null);
  readonly error = signal('');
  private readonly auth = inject(Auth);
  private readonly reservationService = inject(Reservation);
  readonly paymentChecking = signal(false);
  readonly paymentMessage = signal('Vérification du paiement auprès de Wave…');
  paymentToken: string | null = null;

  ngOnInit(): void {
    if (window.location.hash === '#admin') this.page.set('admin-login');
    const url = new URL(window.location.href);
    const paymentToken = url.searchParams.get('token');
    if (paymentToken) {
      this.paymentToken = paymentToken;
      this.page.set('payment-return');
      this.verifyWavePayment(paymentToken);
    } else if (url.searchParams.get('payment') === 'error') {
      this.page.set('payment-return');
      this.paymentMessage.set('Le paiement n’a pas été confirmé. Tu peux réessayer.');
    }
    this.caravane.getActiveSession().subscribe({
      next: (session) => this.session.set(session),
      error: (error: unknown) => this.showConnectionError(error),
    });
  }

  goHome(): void {
    this.auth.logout();
    const url = new URL(window.location.href);
    url.searchParams.delete('payment');
    url.searchParams.delete('token');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    this.page.set('home');
    this.receipt.set(null);
    this.error.set('');
  }

  startReservation(): void {
    if (!this.session()?.active) return;
    this.error.set('');
    this.page.set('reservation');
  }

  showTicket(receipt: ReservationReceipt): void {
    this.receipt.set(receipt);
    this.page.set('ticket');
  }

  openAdminLogin(): void {
    this.auth.logout();
    this.error.set('');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#admin`);
    this.page.set('admin-login');
  }

  onAdminAuthenticated(): void {
    this.page.set('admin');
  }

  logoutAdmin(): void {
    this.auth.logout();
    this.openAdminLogin();
  }

  retryWaveVerification(): void {
    if (this.paymentToken) this.verifyWavePayment(this.paymentToken);
  }

  private verifyWavePayment(paymentToken: string): void {
    if (this.paymentChecking()) return;
    this.paymentChecking.set(true);
    this.paymentMessage.set('Vérification du paiement auprès de Wave…');
    this.reservationService.checkWavePayment(paymentToken).pipe(
      expand((result) => result.status === 'PENDING'
        ? timer(2000).pipe(switchMap(() => this.reservationService.checkWavePayment(paymentToken)))
        : EMPTY),
      take(31),
      last(),
    ).subscribe({
      next: (result) => {
        this.paymentChecking.set(false);
        if (result.status === 'SUCCEEDED' && result.reservation) {
          this.clearPaymentReturnParameters();
          this.showTicket({ reservation: result.reservation, paymentMethod: 'WAVE', testMode: false });
        } else if (result.status === 'FAILED') {
          this.paymentMessage.set('Wave n’a pas confirmé le paiement. Aucun billet n’a été émis.');
          this.clearPaymentReturnParameters();
        } else {
          this.paymentMessage.set('Le paiement est toujours en attente de confirmation. Tu peux vérifier à nouveau dans quelques instants.');
        }
      },
      error: (error: unknown) => {
        this.paymentChecking.set(false);
        const response = error instanceof HttpErrorResponse ? error.error : null;
        const message = typeof response === 'string' ? response : response?.message;
        this.paymentMessage.set(typeof message === 'string'
          ? message
          : 'La vérification Wave a échoué. Réessaie, aucun billet ne sera émis sans confirmation.');
      },
    });
  }

  private clearPaymentReturnParameters(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('payment');
    url.searchParams.delete('token');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    this.paymentToken = null;
  }

  updateSession(session: CaravaneSession | null): void {
    this.session.set(session);
  }

  private showConnectionError(error: unknown): void {
    const response = error instanceof HttpErrorResponse ? error.error : null;
    const message = typeof response === 'string' ? response : response?.message;
    this.error.set(typeof message === 'string' ? message : 'Impossible de joindre le serveur. Vérifie que le backend est démarré.');
  }
}
