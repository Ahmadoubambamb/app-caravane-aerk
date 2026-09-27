import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Bus } from '../models/bus';
import { CaravaneSession } from '../models/caravane-session';
import { Reservation } from '../models/reservation';
import { API_BASE_URL } from '../core/api-url';

@Injectable({
  providedIn: 'root',
})
export class Caravane {
  private readonly http = inject(HttpClient);
  private readonly publicEndpoint = `${API_BASE_URL}/api/public`;
  private readonly adminEndpoint = `${API_BASE_URL}/api/admin`;

  getActiveSession(): Observable<CaravaneSession | null> {
    return this.http.get<CaravaneSession | null>(`${this.publicEndpoint}/caravane-statut`);
  }

  startSession(datesDepart: string): Observable<CaravaneSession> {
    const params = new HttpParams().set('datesDepart', datesDepart);
    return this.http.post<CaravaneSession>(`${this.adminEndpoint}/demarrer-caravane`, null, { params });
  }

  closeSession(): Observable<string> {
    return this.http.post(`${this.adminEndpoint}/fermer-caravane`, null, { responseType: 'text' });
  }

  getBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.adminEndpoint}/buses`);
  }

  getPassengers(busNumber: number, sessionId: number): Observable<Reservation[]> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.get<Reservation[]>(`${this.adminEndpoint}/bus/${busNumber}/passagers`, { params });
  }
}
