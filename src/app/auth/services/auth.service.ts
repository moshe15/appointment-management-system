import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export enum UserType {
  CLIENT = 'client',
  BUSINESS = 'business'
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // בדיקה אם יש משתמש מחובר בזיכרון המקומי
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  isAuthenticated(): Observable<boolean> {
    return of(!!this.currentUserSubject.value).pipe(delay(100));
  }

  signIn(email: string, password: string): Observable<User> {
    // כאן תהיה בקשת HTTP אמיתית לשרת
    // כרגע זו סימולציה של התחברות
    if (email && password) {
      // בדיקה פשוטה להדגמה - במציאות נבצע אימות מול שרת
      if (email.includes('business')) {
        const user: User = {
          id: '1',
          email,
          name: 'בעל עסק',
          type: UserType.BUSINESS
        };
        return of(user).pipe(
          delay(1000),
          tap(user => this.setCurrentUser(user))
        );
      } else {
        const user: User = {
          id: '2',
          email,
          name: 'לקוח',
          type: UserType.CLIENT
        };
        return of(user).pipe(
          delay(1000),
          tap(user => this.setCurrentUser(user))
        );
      }
    }

    return throwError(() => new Error('שם משתמש או סיסמה שגויים'));
  }

  signUp(email: string, password: string, name: string, type: UserType): Observable<User> {
    // כאן תהיה בקשת HTTP אמיתית לשרת
    // כרגע זו סימולציה של הרשמה
    if (email && password && name) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        type
      };
      
      return of(user).pipe(
        delay(1000),
        tap(user => this.setCurrentUser(user))
      );
    }

    return throwError(() => new Error('נתוני הרשמה שגויים'));
  }

  signOut(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    
    // הפניה לאזור המתאים לפי סוג המשתמש
    if (user.type === UserType.BUSINESS) {
      this.router.navigate(['/business']);
    } else {
      this.router.navigate(['/client']);
    }
  }
  
  getUserType(): UserType | null {
    const user = this.currentUserSubject.value;
    return user ? user.type : null;
  }
} 