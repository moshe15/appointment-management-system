import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export enum UserType {
  CLIENT = 'client',
  BUSINESS = 'business',
  ADMIN = 'admin'
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
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  
  // מאגר משתמשים בדויים לדוגמה
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'client@example.com',
      name: 'משתמש לקוח',
      type: UserType.CLIENT
    },
    {
      id: '2',
      email: 'business@example.com',
      name: 'משתמש עסקי',
      type: UserType.BUSINESS
    }
  ];
  
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // בדיקה האם יש משתמש מחובר במצב הנוכחי - רק בדפדפן
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (e) {
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    // בסביבת הדגמה, אנו מחפשים את המשתמש לפי אימייל בלבד
    const user = this.mockUsers.find((u: User) => u.email === email);
    
    if (user) {
      // שמירת המשתמש באחסון המקומי
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      
      return of(user).pipe(delay(1000)); // Simulate network delay
    }
    
    return throwError(() => 'שם משתמש או סיסמה שגויים');
  }

  register(userData: Partial<User>, password: string, userType: UserType): Observable<User> {
    // בדיקה אם האימייל כבר קיים
    const exists = this.mockUsers.some((u: User) => u.email === userData.email);
    
    if (exists) {
      return throwError(() => 'האימייל כבר קיים במערכת');
    }
    
    // יצירת משתמש חדש
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9), // מזהה אקראי
      email: userData.email!,
      name: userData.name || '',
      type: userType
    };
    
    // הוספת המשתמש למאגר
    this.mockUsers.push(newUser);
    
    // התחברות אוטומטית
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
    this.currentUserSubject.next(newUser);
    this.isAuthenticatedSubject.next(true);
    
    return of(newUser).pipe(delay(1000)); // Simulate network delay
  }

  signOut(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  private setCurrentUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    // ניווט אוטומטי למסך הנכון בהתאם לסוג המשתמש
    if (user.type === UserType.CLIENT) {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/business']);
    }
  }
} 