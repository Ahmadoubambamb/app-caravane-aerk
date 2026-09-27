import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authorization = inject(Auth).authorization;
  if (authorization && req.url.includes('/api/admin/')) {
    return next(req.clone({ setHeaders: { Authorization: authorization } }));
  }
  return next(req);
};
