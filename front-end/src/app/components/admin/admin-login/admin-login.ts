import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private readonly auth = inject(Auth);
  readonly authenticated = output<void>();
  readonly cancel = output<void>();
  readonly loading = signal(false);
  readonly error = signal('');
  credentials = { username: '', password: '' };

  login(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.credentials.username.trim(), this.credentials.password).subscribe({
      next: () => {
        this.credentials.password = '';
        this.loading.set(false);
        this.authenticated.emit();
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 0
            ? 'Le serveur ne répond pas.'
            : 'Identifiant ou mot de passe invalide.',
        );
      },
    });
  }
}
