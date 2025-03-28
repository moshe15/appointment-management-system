import { Component, OnInit, OnDestroy } from '@angular/core';
import { GoogleCalendarService } from '../../services/google-calendar.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CalendarComponent implements OnInit, OnDestroy {
  events: any[] = [];
  calendarList: any[] = [];
  selectedCalendarId: string = '';
  authSubscription: Subscription = new Subscription();
  isAuthenticated: boolean = false;
  isLoading = false;
  
  // הגדרה לאירוע חדש
  newEvent: any = {
    summary: '',
    description: '',
    start: {
      dateTime: new Date().toISOString(),
      timeZone: 'Asia/Jerusalem'
    },
    end: {
      dateTime: new Date().toISOString(),
      timeZone: 'Asia/Jerusalem'
    }
  };

  constructor(private calendarService: GoogleCalendarService) { }

  ngOnInit(): void {
    // מעקב אחר סטטוס האימות
    this.authSubscription = this.calendarService.authStatus$.subscribe(
      (isAuthenticated: boolean) => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.loadCalendars();
        }
      }
    );
  }

  ngOnDestroy(): void {
    // ביטול ההרשמה ל-observables
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  login(): void {
    this.isLoading = true;
    this.calendarService.signIn()
      .then(() => {
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('שגיאת התחברות:', error);
        this.isLoading = false;
      });
  }

  logout(): void {
    this.isLoading = true;
    this.calendarService.signOut()
      .then(() => {
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('שגיאת התנתקות:', error);
        this.isLoading = false;
      });
  }

  loadCalendars(): void {
    this.isLoading = true;
    this.calendarService.getCalendarList().subscribe(
      (data: any) => {
        this.calendarList = data.items || [];
        if (this.calendarList.length > 0) {
          this.selectedCalendarId = this.calendarList[0].id;
          this.loadEvents();
        }
        this.isLoading = false;
      },
      (error: any) => {
        console.error('שגיאה בטעינת רשימת לוחות השנה:', error);
        this.isLoading = false;
      }
    );
  }

  loadEvents(): void {
    if (!this.selectedCalendarId) return;
    
    this.isLoading = true;
    this.calendarService.getEvents(this.selectedCalendarId).subscribe(
      (data: any) => {
        this.events = data.items || [];
        // מיון האירועים לפי זמן
        this.events.sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());
        this.isLoading = false;
      },
      (error: any) => {
        console.error('שגיאה בטעינת אירועים:', error);
        this.isLoading = false;
      }
    );
  }

  onCalendarChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCalendarId = target.value;
    this.loadEvents();
  }

  createNewEvent(): void {
    if (!this.selectedCalendarId || !this.newEvent.summary) return;
    
    this.isLoading = true;
    this.calendarService.createEvent(this.selectedCalendarId, this.newEvent).subscribe(
      (data: any) => {
        this.events.push(data);
        this.events.sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());
        this.resetNewEvent();
        this.isLoading = false;
      },
      (error: any) => {
        console.error('שגיאה ביצירת אירוע חדש:', error);
        this.isLoading = false;
      }
    );
  }

  resetNewEvent(): void {
    this.newEvent = {
      summary: '',
      description: '',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: new Date().toISOString(),
        timeZone: 'Asia/Jerusalem'
      }
    };
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL');
  }
} 