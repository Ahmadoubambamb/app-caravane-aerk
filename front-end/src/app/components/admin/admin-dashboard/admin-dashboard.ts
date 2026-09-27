import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bus } from '../../../models/bus';
import { CaravaneSession } from '../../../models/caravane-session';
import { Reservation } from '../../../models/reservation';
import { Caravane } from '../../../services/caravane';
import { PrintBusList } from '../print-bus-list/print-bus-list';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, DecimalPipe, PrintBusList],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly caravane = inject(Caravane);
  readonly sessionChange = output<CaravaneSession | null>();
  readonly logout = output<void>();
  readonly session = signal<CaravaneSession | null>(null);
  readonly buses = signal<Bus[]>([]);
  readonly selectedBus = signal<Bus | null>(null);
  readonly passengers = signal<Reservation[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  departureDates = '';

  ngOnInit(): void {
    this.loadSession();
  }

  startSession(): void {
    const dates = this.departureDates.trim();
    if (!dates) return;
    this.loading.set(true);
    this.error.set('');
    this.caravane.startSession(dates).subscribe({
      next: (session) => {
        this.updateSession(session);
        this.departureDates = '';
        this.loading.set(false);
        this.loadBuses();
      },
      error: (error: unknown) => this.handleError(error, 'La session n’a pas pu démarrer.'),
    });
  }

  closeSession(): void {
    if (!window.confirm('Arrêter les inscriptions et fermer la session active ?')) return;
    this.loading.set(true);
    this.error.set('');
    this.caravane.closeSession().subscribe({
      next: () => {
        this.updateSession(null);
        this.buses.set([]);
        this.passengers.set([]);
        this.selectedBus.set(null);
        this.loading.set(false);
      },
      error: (error: unknown) => this.handleError(error, 'La session n’a pas pu être fermée.'),
    });
  }

  loadBuses(): void {
    if (!this.session()?.active) return;
    this.caravane.getBuses().subscribe({
      next: (buses) => {
        this.buses.set(buses);
        const currentId = this.selectedBus()?.id;
        const bus = buses.find((item) => item.id === currentId) ?? buses[0] ?? null;
        this.selectedBus.set(bus);
        if (bus) this.selectBus(bus);
        else this.passengers.set([]);
      },
      error: (error: unknown) => this.handleError(error, 'La liste des bus est indisponible.'),
    });
  }

  selectBus(bus: Bus): void {
    this.selectedBus.set(bus);
    const sessionId = this.session()?.id;
    if (sessionId === undefined) return;
    this.caravane.getPassengers(bus.numeroBus, sessionId).subscribe({
      next: (passengers) => this.passengers.set(passengers),
      error: (error: unknown) => this.handleError(error, 'La liste des passagers est indisponible.'),
    });
  }

  private loadSession(): void {
    this.caravane.getActiveSession().subscribe({
      next: (session) => {
        this.updateSession(session);
        if (session?.active) this.loadBuses();
      },
      error: (error: unknown) => this.handleError(error, 'Impossible de joindre le serveur. Vérifie que le backend est démarré.'),
    });
  }

  private updateSession(session: CaravaneSession | null): void {
    this.session.set(session);
    this.sessionChange.emit(session);
  }

  private handleError(error: unknown, fallback: string): void {
    const response = error instanceof HttpErrorResponse ? error.error : null;
    const message = typeof response === 'string' ? response : response?.message;
    this.error.set(typeof message === 'string' ? message : fallback);
    this.loading.set(false);
  }
}
