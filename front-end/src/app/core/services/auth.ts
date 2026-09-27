import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private authorizationHeader: string | null = null;

  login(username: string, password: string): Observable<void> {
    this.authorizationHeader = null;
    const credentials = new TextEncoder().encode(`${username}:${password}`);
    const encodedCredentials = btoa(
      Array.from(credentials, (byte) => String.fromCharCode(byte)).join(''),
    );
    const header = `Basic ${encodedCredentials}`;

    return this.http
      .get<void>('http://localhost:8080/api/admin/auth-check', {
        headers: new HttpHeaders({ Authorization: header }),
      })
      .pipe(
        tap(() => {
          this.authorizationHeader = header;
        }),
        map(() => undefined),
      );
  }

  get authorization(): string | null {
    return this.authorizationHeader;
  }

  get isAuthenticated(): boolean {
    return this.authorizationHeader !== null;
  }

  logout(): void {
    this.authorizationHeader = null;
  }
}
