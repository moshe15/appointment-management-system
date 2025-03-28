import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // בSSR תמיד מאפשרים גישה
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // במצב דפדפן בודקים אם המשתמש מחובר
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // אם המשתמש לא מחובר, מעבירים לדף הלוגין
  router.navigate(['/auth/login']);
  return false;
}; 