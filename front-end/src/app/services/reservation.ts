import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PaymentMethod,
  PaymentMode,
  Reservation as ReservationModel,
  ReservationPayload,
  WaveCheckoutResponse,
  WavePaymentStatus,
} from '../models/reservation';
import { API_BASE_URL } from '../core/api-url';

interface PaymentModeResponse {
  mode: PaymentMode;
}

@Injectable({ providedIn: 'root' })
export class Reservation {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/public`;

  getPaymentMode(): Observable<PaymentModeResponse> {
    return this.http.get<PaymentModeResponse>(`${this.endpoint}/paiements/mode`);
  }

  simulatePayment(payload: ReservationPayload, moyenPaiement: PaymentMethod): Observable<ReservationModel> {
    return this.http.post<ReservationModel>(`${this.endpoint}/paiements/simuler`, {
      ...payload,
      moyenPaiement,
    });
  }

  createWaveCheckout(payload: ReservationPayload): Observable<WaveCheckoutResponse> {
    return this.http.post<WaveCheckoutResponse>(`${this.endpoint}/paiements/wave`, payload);
  }

  checkWavePayment(paymentToken: string): Observable<WavePaymentStatus> {
    return this.http.get<WavePaymentStatus>(`${this.endpoint}/paiements/wave/${encodeURIComponent(paymentToken)}`);
  }
}
