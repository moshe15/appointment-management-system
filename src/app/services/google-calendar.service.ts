import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, from, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private isInitialized = false;
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();
  authStatusChanged = new Subject<boolean>();
  private apiUrl = 'https://your-api-url.com'; // ודא שהכתובת נכונה
  private gapi: any; // או סוג מדויק יותר אם אפשר

  constructor(private http: HttpClient) {
    // נסה לאתחל את הספרייה כאשר השירות נוצר
    this.initClient();
  }

  /**
   * אתחול ספריית Google API
   */
  async initClient(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            clientId: environment.googleApi.clientId,
            scope: environment.googleApi.scopes,
            discoveryDocs: environment.googleApi.discoveryDocs
          });
          
          this.isInitialized = true;
          const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
          this.authStatusSubject.next(isSignedIn);
          
          // האזנה לשינויים במצב ההתחברות
          gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn: boolean) => {
            this.authStatusSubject.next(signedIn);
          });
          
          this.gapi = gapi;
          resolve();
        } catch (error) {
          console.error('שגיאה באתחול Google API:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * התחברות למשתמש
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initClient();
    }
    
    try {
      await gapi.auth2.getAuthInstance().signIn();
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      throw error;
    }
  }

  /**
   * יציאה מהמשתמש
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) {
      await this.initClient();
    }
    
    try {
      await gapi.auth2.getAuthInstance().signOut();
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
      throw error;
    }
  }

  /**
   * בדיקה אם המשתמש מחובר
   */
  isSignedIn(): boolean {
    if (!this.isInitialized || !gapi.auth2) {
      return false;
    }
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  /**
   * קבלת רשימת היומנים של המשתמש
   */
  getCalendarList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/calendars`);
  }

  /**
   * קבלת אירועים מיומן
   */
  getEvents(calendarId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/calendars/${calendarId}/events`);
  }

  /**
   * יצירת אירוע חדש
   */
  createEvent(calendarId: string, event: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calendars/${calendarId}/events`, event);
  }

  fetchCalendarList(): Observable<any[]> {
    return this.http.get<any>('https://www.googleapis.com/calendar/v3/users/me/calendarList')
      .pipe(
        map(response => response.items || [])
      );
  }

  fetchEvents(calendarId: string): Observable<any[]> {
    return this.http.get<any>(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`)
      .pipe(
        map(response => response.items || [])
      );
  }

  addEvent(eventData: any): Promise<any> {
    return this.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: eventData
    }).then((response: any) => response.result);
  }
} 