// הוספת הצהרות טיפוס עבור gapi ו-google
declare const gapi: any;
declare const google: any;

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: { email: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private readonly API_KEY = 'AIzaSyADYWIGo-WurOR_OKC3XbFtdcBvN5U_YG8';
  private readonly CLIENT_ID = '718463343222-ttbj3767uj89so0fp56hg2m8ne0csl6c.apps.googleusercontent.com';
  private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private readonly SCOPES = 'https://www.googleapis.com/auth/calendar';

  private tokenClient: any; // שימוש ב-any במקום סוג ספציפי
  private gapiInitialized = new BehaviorSubject<boolean>(false);
  private gisInitialized = new BehaviorSubject<boolean>(false);
  private isSignedInSubject = new BehaviorSubject<boolean>(false);
  private gapiLoaded = false;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  /**
   * טעינת ספריות גוגל והתחלת התהליך
   */
  public initGoogleApi(): Observable<boolean> {
    console.log('שירות גוגל קלנדר מושבת');
    return of(false);
  }

  /**
   * טעינת סקריפט GAPI
   */
  private loadGapiScript(): Observable<boolean> {
    if (typeof gapi !== 'undefined') {
      return of(true);
    }

    return new Observable<boolean>(observer => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        observer.next(true);
        observer.complete();
      };
      script.onerror = () => {
        observer.error('נכשל בטעינת ספריית Google API');
      };
      document.head.appendChild(script);
    });
  }

  /**
   * טעינת סקריפט GIS
   */
  private loadGisScript(): Observable<boolean> {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
      return of(true);
    }

    return new Observable<boolean>(observer => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        observer.next(true);
        observer.complete();
      };
      script.onerror = () => {
        observer.error('נכשל בטעינת ספריית Google Identity Services');
      };
      document.head.appendChild(script);
    });
  }

  /**
   * אתחול לקוח GAPI
   */
  private initializeGapiClient(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: [this.DISCOVERY_DOC],
          });

          this.gapiInitialized.next(true);
          
          // יצירת לקוח הטוקן
          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                this.isSignedInSubject.next(true);
              }
            },
            error_callback: (error: any) => {
              console.error('שגיאת אימות Google:', error);
              this.isSignedInSubject.next(false);
            }
          });
          
          this.gisInitialized.next(true);
          observer.next(true);
          observer.complete();
        } catch (error) {
          observer.error('שגיאה באתחול לקוח GAPI: ' + error);
        }
      });
    });
  }

  /**
   * בדיקה אם המשתמש מחובר
   */
  public isUserSignedIn(): boolean {
    return this.isSignedInSubject.getValue();
  }

  /**
   * הוספת אירוע ללוח שנה
   */
  public addEventToCalendar(event: CalendarEvent): Observable<string | null> {
    if (!this.isSignedInSubject.getValue()) {
      return of(null);
    }

    const calendarEvent = {
      'summary': event.summary,
      'location': event.location,
      'description': event.description,
      'start': {
        'dateTime': event.start.dateTime,
        'timeZone': event.start.timeZone
      },
      'end': {
        'dateTime': event.end.dateTime,
        'timeZone': event.end.timeZone
      },
      'reminders': {
        'useDefault': false,
        'overrides': [
          { 'method': 'email', 'minutes': 24 * 60 },
          { 'method': 'popup', 'minutes': 30 }
        ]
      }
    };

    return from(gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': calendarEvent
    })).pipe(
      map((response: any) => {
        const result = response.result;
        console.log('אירוע נוצר בהצלחה: %s', result.htmlLink);
        this.messageService.add({
          severity: 'success',
          summary: 'הצלחה!',
          detail: 'התור נוסף ללוח השנה שלך בהצלחה!'
        });
        return result.htmlLink;
      }),
      catchError(error => {
        console.error('שגיאה ביצירת אירוע:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'לא ניתן להוסיף את התור ללוח השנה. נסה שוב מאוחר יותר.'
        });
        return of(null);
      })
    );
  }

  /**
   * יצירת קישור לפתיחת אפליקציית לוח שנה במכשיר נייד
   */
  public createCalendarLink(event: CalendarEvent): string {
    const encodeURI = encodeURIComponent;
    const startDate = event.start.dateTime.replace(/-|:|\.\d+/g, '');
    const endDate = event.end.dateTime.replace(/-|:|\.\d+/g, '');
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURI(event.summary)}&dates=${startDate}/${endDate}&details=${encodeURI(event.description)}&location=${encodeURI(event.location || '')}&sf=true&output=xml`;
  }

  /**
   * בדיקה אם המשתמש במכשיר נייד
   */
  public isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  loadGapi(): Promise<void> {
    if (this.gapiLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // בדיקה אם אנחנו בסביבת דפדפן
      if (typeof window !== 'undefined') {
        // מטמיע טעינה בטוחה של gapi
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          // נטען במקום מידע למנוע שגיאות
          this.gapiLoaded = true;
          this.isSignedInSubject.next(false);
          resolve();
        };
        script.onerror = (error) => {
          reject(error);
        };
        document.body.appendChild(script);
      } else {
        // פתרון עוקף לסביבות SSR
        this.gapiLoaded = true;
        resolve();
      }
    });
  }

  isSignedIn(): boolean {
    return this.isSignedInSubject.value;
  }

  signIn(): Promise<void> {
    console.log('שירות גוגל קלנדר מושבת');
    return new Promise<void>((resolve, reject) => {
      if (!this.gapiInitialized.getValue() || !this.gisInitialized.getValue()) {
        reject('שירותי Google לא אותחלו. נסה שוב מאוחר יותר.');
        return;
      }

      this.tokenClient.requestAccessToken({
        prompt: 'consent'
      });
      
      // המתנה לתגובת הרשאות
      const subscription = this.isSignedInSubject.subscribe(signedIn => {
        if (signedIn) {
          subscription.unsubscribe();
          resolve();
        }
      });
      
      // התחברות ידנית במקרה והקולבק לא מופעל
      setTimeout(() => {
        if (!this.isSignedInSubject.getValue()) {
          subscription.unsubscribe();
          reject('לא ניתן להתחבר לחשבון Google. נסה שוב מאוחר יותר.');
        }
      }, 10000); // 10 שניות טיים-אאוט
    });
  }

  signOut(): Promise<void> {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
        this.isSignedInSubject.next(false);
      });
    }
    return Promise.resolve();
  }

  addEvent(appointment: any): Promise<any> {
    console.log('שירות גוגל קלנדר מושבת');
    return new Promise((resolve) => {
      // מדמה הוספת אירוע מוצלחת
      setTimeout(() => {
        resolve({
          id: 'mock-event-id-' + Math.random().toString(36).substring(7),
          htmlLink: 'https://calendar.google.com/calendar/event?eid=mock',
          summary: `תור עם ${appointment.businessName}`
        });
      }, 500);
    });
  }

  initClient(): Promise<boolean> {
    console.log('שירות גוגל קלנדר מושבת');
    return Promise.resolve(false);
  }

  createEvent(event: CalendarEvent): Promise<any> {
    console.log('שירות גוגל קלנדר מושבת');
    return Promise.resolve({});
  }
} 