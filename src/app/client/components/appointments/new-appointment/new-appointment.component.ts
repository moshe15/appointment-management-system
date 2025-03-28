import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentsDataService, Appointment } from '../../../../core/services/appointments-data.service';
import { GoogleCalendarService, CalendarEvent } from '../../../../core/services/google-calendar.service';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { provideAnimations } from '@angular/platform-browser/animations';

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  hasStylists?: boolean;
  googleCalendarIntegration?: boolean;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  stylistId?: string;
}

interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  avatar?: string;
  rating?: number;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  stylistId?: string;
}

interface AppointmentData {
  businessId: string;
  businessName: string;
  businessAddress: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  price: number;
  date: Date;
  time: string;
  duration: number;
  startTime: string;
  endTime: string;
  notes: string;
  stylistId?: string;
  stylistName?: string;
  status: string;
}

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  providers: [MessageService],
  templateUrl: './new-appointment.component.html',
  styleUrls: ['./new-appointment.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    RatingModule,
    StepsModule,
    ToastModule,
    RouterLink,
    FullCalendarModule,
    HttpClientModule
  ],
  animations: []
})
export class NewAppointmentComponent implements OnInit, AfterViewInit {
  items: MenuItem[] = [];
  activeIndex = 0;
  
  businesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  selectedBusiness: Business | null = null;
  
  services: Service[] = [];
  selectedService: Service | null = null;
  
  stylists: Stylist[] = [];
  selectedStylist: Stylist | null = null;
  showStylistSelection: boolean = false;
  
  minDate: Date = new Date();
  maxDate: Date = new Date();
  selectedDate: Date = new Date();
  disabledDates: Date[] = [];
  
  availableTimeSlots: TimeSlot[] = [];
  selectedTimeSlot: TimeSlot | null = null;
  
  notes: string = '';
  confirmationNumber: string = '';
  
  addToGoogleCalendar: boolean = false;
  googleCalendarAvailable: boolean = false;
  calendarEventCreated: boolean = false;
  
  isGapiLoaded: boolean = false;
  isAuthenticated: boolean = false;
  isGoogleCalendarSyncEnabled: boolean = false;
  
  addToLocalCalendar: boolean = false;
  calendarFileUrl: SafeUrl | null = null;
  showCalendarOptions: boolean = false;
  downloadReady: boolean = false;
  
  // הוספת משתנים ללוח שנה מלא
  calendarOptions: CalendarOptions = {};
  availableSlots: EventInput[] = [];
  selectedSlotInfo: any = null;
  selectedSlotId: string | null = null;
  businessHours = {
    startTime: '09:00',
    endTime: '19:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5] // ימים א-ו
  };
  slotDuration = '00:30:00'; // 30 דקות לכל חלון זמן
  
  isMobile: boolean = false;
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private appointmentsDataService: AppointmentsDataService,
    private googleCalendarService: GoogleCalendarService,
    private zone: NgZone,
    private sanitizer: DomSanitizer
  ) {
    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 1);
    
    this.confirmationNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }
  
  ngOnInit() {
    this.maxDate.setMonth(this.maxDate.getMonth() + 3);
    
    this.items = [
      { label: 'בחירת עסק', styleClass: 'active-step' },
      { label: 'בחירת שירות', styleClass: '' },
      { label: 'בחירת ספר', styleClass: '', visible: false },
      { label: 'בחירת תאריך ושעה', styleClass: '' },
      { label: 'סיכום', styleClass: '' },
      { label: 'אישור', styleClass: '' }
    ];
    
    this.businesses = [
      { id: 'b1', name: 'סלון יופי שירה', category: 'טיפולי יופי', rating: 4.5 },
      { id: 'b2', name: 'אלון עיצוב שיער', category: 'מספרה', rating: 4.8 },
      { id: 'b3', name: 'נייל סטודיו לאה', category: 'מניקור ופדיקור', rating: 4.2 },
      { id: 'b4', name: 'עיסוי בריא', category: 'עיסוי', rating: 4.6 },
      { id: 'b5', name: 'איפור מקצועי מיכל', category: 'איפור', rating: 4.7 },
      { id: 'b6', name: 'הייר סטייל', category: 'מספרה', rating: 4.3 },
      { id: 'b7', name: 'מספרת אמיגוס', category: 'מספרה', rating: 4.9, hasStylists: true, googleCalendarIntegration: true }
    ];
    
    this.filteredBusinesses = [...this.businesses];
    
    this.setupCalendarOptions();
  }
  
  ngAfterViewInit() {
    // נטען את הזמנים הזמינים אחרי שהקומפוננטה מוצגת
    setTimeout(() => {
      this.loadAvailableTimeSlots();
    }, 100);
  }
  
  setupCalendarOptions() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      },
      locale: heLocale,
      direction: 'rtl',
      height: 'auto',
      selectable: true,
      selectMirror: true,
      slotDuration: this.slotDuration,
      allDaySlot: false,
      businessHours: this.businessHours,
      slotMinTime: this.businessHours.startTime,
      slotMaxTime: this.businessHours.endTime,
      selectConstraint: 'businessHours',
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      dateClick: (info) => {
        console.log('תאריך נלחץ:', info.date);
        this.selectedDate = info.date;
        this.generateTimeSlots();
        this.messageService.add({
          severity: 'info',
          summary: 'תאריך נבחר',
          detail: `בחרת את התאריך ${info.date.toLocaleDateString('he-IL')}`
        });
      },
      selectAllow: (selectInfo) => {
        // מניעת בחירה של תאריכים שעברו
        const now = new Date();
        return selectInfo.start >= now;
      },
      validRange: {
        start: new Date(),
        end: new Date(new Date().setMonth(new Date().getMonth() + 2)) // חודשיים קדימה
      },
      editable: false,
      eventDragStart: () => console.log('גרירת אירוע התחילה'),
      eventDragStop: () => console.log('גרירת אירוע הסתיימה')
    };
  }
  
  loadGoogleCalendarApi() {
    console.log("גוגל קלנדר מבוטל");
  }
  
  checkIfSignedIn() {
    console.log("גוגל קלנדר מבוטל");
  }
  
  signInToGoogle(): Promise<void> {
    console.log("גוגל קלנדר מבוטל");
    return Promise.resolve();
  }
  
  loadDemoServices() {
    if (this.selectedBusiness?.id === 'b1') {
      this.services = [
        { id: 's1', name: 'טיפול פנים', duration: 60, price: 250, description: 'טיפול פנים מלא כולל ניקוי עמוק' },
        { id: 's2', name: 'מניקור', duration: 45, price: 120, description: 'מניקור איכותי עם לק ג\'ל' },
        { id: 's3', name: 'פדיקור', duration: 60, price: 150, description: 'פדיקור רפואי' },
        { id: 's4', name: 'שעווה רגליים', duration: 30, price: 180 }
      ];
    } else if (this.selectedBusiness?.id === 'b2') {
      this.services = [
        { id: 's5', name: 'תספורת גבר', duration: 30, price: 80 },
        { id: 's6', name: 'תספורת אישה', duration: 45, price: 150, description: 'כולל שמפו ופן' },
        { id: 's7', name: 'צבע שיער', duration: 120, price: 300, description: 'צבע לכל השיער' },
        { id: 's8', name: 'פן', duration: 30, price: 100 }
      ];
    } else if (this.selectedBusiness?.id === 'b7') {
      this.loadAmigosStylists();
      
      this.services = [
        { id: 's20', name: 'תספורת גבר', duration: 30, price: 70, description: 'תספורת גבר כולל שמפו' },
        { id: 's21', name: 'תספורת אישה', duration: 45, price: 130, description: 'תספורת אישה כולל שמפו ופן' },
        { id: 's22', name: 'תספורת ילדים', duration: 20, price: 55, description: 'תספורת לילדים עד גיל 12' },
        { id: 's23', name: 'צבע שיער', duration: 120, price: 280, description: 'צבע לכל השיער' },
        { id: 's24', name: 'פן', duration: 25, price: 90, description: 'פן מעוצב' },
        { id: 's25', name: 'גוונים', duration: 90, price: 350, description: 'גוונים מקצועיים' }
      ];
    } else {
      this.services = [
        { id: 's9', name: 'שירות 1', duration: 60, price: 200 },
        { id: 's10', name: 'שירות 2', duration: 45, price: 180 },
        { id: 's11', name: 'שירות 3', duration: 30, price: 150 }
      ];
    }
  }
  
  loadAmigosStylists() {
    this.stylists = [
      { 
        id: 'stylist1', 
        name: 'משה כהן', 
        specialties: ['תספורת גבר', 'זקן', 'תספורת ילדים'],
        rating: 4.8
      },
      { 
        id: 'stylist2', 
        name: 'יעל לוי', 
        specialties: ['תספורת אישה', 'צבע שיער', 'פן', 'גוונים'],
        rating: 4.9
      },
      { 
        id: 'stylist3', 
        name: 'דניאל אברהם', 
        specialties: ['תספורת גבר', 'תספורת אישה', 'צבע שיער'],
        rating: 4.7
      }
    ];
    
    this.showStylistSelection = this.selectedBusiness?.hasStylists || false;
  }
  
  selectStylist(stylist: Stylist) {
    this.selectedStylist = stylist;
    
    if (this.selectedBusiness?.id === 'b7') {
      this.updateServicePriceForStylist('s20', 75);
      this.updateServicePriceForStylist('s22', 50);
    }
  }
  
  updateServicePriceForStylist(serviceId: string, newPrice: number) {
    const serviceIndex = this.services.findIndex(s => s.id === serviceId);
    if (serviceIndex !== -1) {
      this.services[serviceIndex] = {
        ...this.services[serviceIndex],
        price: newPrice
      };
    }
  }
  
  selectService(service: Service) {
    this.selectedService = service;
    
    // עדכון לוח הזמנים אם יש צורך (למשל, אם לשירות מסוים יש שעות מיוחדות)
    this.loadAvailableTimeSlots();
  }
  
  loadAvailableTimeSlots() {
    // כאן בדרך כלל תבוא קריאת API לקבלת השעות הזמינות
    // לצורך הדוגמה, נייצר שעות אקראיות
    
    this.availableSlots = [];
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    for (let date = new Date(currentDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // דלג על יום שבת
      if (date.getDay() === 6) continue;
      
      const startHour = parseInt(this.businessHours.startTime.split(':')[0]);
      const endHour = parseInt(this.businessHours.endTime.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // 70% מהשעות זמינות (אקראי)
          if (Math.random() > 0.3) {
            const slotDate = new Date(date);
            slotDate.setHours(hour, minute, 0, 0);
            
            // וודא שהשעה אינה בעבר
            if (slotDate > new Date()) {
              this.availableSlots.push({
                id: `slot-${slotDate.getTime()}`,
                title: 'פנוי',
                start: slotDate,
                end: new Date(slotDate.getTime() + 30 * 60000), // 30 דקות
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                textColor: '#ffffff',
                extendedProps: {
                  available: true,
                  slotTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                }
              });
            }
          }
        }
      }
    }
    
    // עדכון לוח השנה עם השעות הזמינות
    this.calendarOptions.events = this.availableSlots;
  }
  
  searchBusinesses(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredBusinesses = this.businesses.filter(business => 
      business.name.toLowerCase().includes(query) || 
      business.category.toLowerCase().includes(query)
    );
  }
  
  selectBusiness(business: Business) {
    this.selectedBusiness = business;
    
    if (business.hasStylists) {
      this.items[2].visible = true;
    } else {
      this.items[2].visible = false;
    }
    
    // כשמשתמש בוחר עסק, טען את לוח הזמנים הזמין
    this.loadDemoServices();
  }
  
  onDateSelect(date: Date) {
    this.selectedDate = date;
    this.generateTimeSlots();
    this.selectedTimeSlot = null;
  }
  
  selectTimeSlot(slot: TimeSlot) {
    this.selectedTimeSlot = slot;
  }
  
  nextStep() {
    if (this.activeIndex === 0 && this.selectedBusiness) {
      this.loadDemoServices();
    }
    
    if (this.activeIndex === 1 && this.selectedService) {
      this.loadAvailableTimeSlots();
    }
    
    if (this.activeIndex < this.items.length - 1) {
      this.activeIndex++;
    }
  }
  
  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }
  
  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }
  
  confirmAppointment() {
    this.activeIndex = 5;
    this.confirmationNumber = Math.floor(100000 + Math.random() * 900000).toString();
    
    // הכן את אובייקט הפגישה עם כל השדות הנדרשים
    const appointmentData: AppointmentData = {
      businessId: this.selectedBusiness!.id,
      businessName: this.selectedBusiness!.name,
      businessAddress: this.selectedBusiness!.name,
      serviceId: this.selectedService!.id,
      serviceName: this.selectedService!.name,
      serviceCategory: this.selectedService!.description || 'כללי',
      price: this.selectedService!.price || 0,
      date: this.selectedDate,
      time: this.selectedTimeSlot!.time,
      duration: this.selectedService!.duration,
      startTime: this.selectedTimeSlot!.time,
      endTime: this.calculateEndTime(this.selectedTimeSlot!.time, this.selectedService!.duration),
      notes: this.notes ? `${this.notes}\nמספר אסמכתא: ${this.confirmationNumber}` : `מספר אסמכתא: ${this.confirmationNumber}`,
      status: 'confirmed',
      ...(this.selectedStylist && {
        stylistId: this.selectedStylist.id,
        stylistName: this.selectedStylist.name
      })
    };
    
    // שמור את הפגישה במערכת
    this.appointmentsDataService.addAppointment(appointmentData).subscribe({
      next: (result) => {
        // תמיד נכין את קובץ לוח השנה להורדה
        this.generateCalendarFile(appointmentData);
        this.addToLocalCalendar = true;
        this.downloadReady = true;
        
        this.showSuccessMessage();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'אירעה שגיאה בשמירת התור. אנא נסה שנית.'
        });
      }
    });
  }
  
  // פונקציה ליצירת קובץ יומן (ICS) להורדה
  generateCalendarFile(appointmentData: AppointmentData) {
    // יצירת אירוע ICS
    const startDate = new Date(appointmentData.date);
    const [startHours, startMinutes] = appointmentData.startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(startDate.getTime());
    endDate.setMinutes(endDate.getMinutes() + appointmentData.duration);
    
    // פורמט התאריכים כפי שנדרש ב-ICS
    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDateString = formatDateForICS(startDate);
    const endDateString = formatDateForICS(endDate);
    
    // בניית תוכן ה-ICS - פורמט בינלאומי לקבצי יומן
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:תור ל${appointmentData.serviceName} ב${appointmentData.businessName}`,
      `DTSTART:${startDateString}`,
      `DTEND:${endDateString}`,
      `LOCATION:${appointmentData.businessAddress}`,
      `DESCRIPTION:שירות: ${appointmentData.serviceName}\\nמחיר: ₪${appointmentData.price}\\n${appointmentData.notes ? 'הערות: ' + appointmentData.notes.replace(/\n/g, '\\n') : ''}`,
      'STATUS:CONFIRMED',
      `ORGANIZER;CN=${appointmentData.businessName}:mailto:noreply@example.com`,
      `UID:${new Date().getTime()}@bookingsystem`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    // יצירת בלוב להורדה
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    
    this.downloadReady = true;
    
    // שימוש ב-URL.createObjectURL כדי ליצור קישור להורדה
    this.calendarFileUrl = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
    
    // בדוק אם המשתמש במכשיר נייד, ואז פתח את האפשרות לשמור
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('קובץ יומן נוצר:', this.calendarFileUrl);
  }
  
  // פונקציה להורדת קובץ היומן
  downloadCalendarFile() {
    if (this.calendarFileUrl) {
      const a = document.createElement('a');
      a.href = this.calendarFileUrl.toString();
      a.download = `תור_${this.selectedBusiness?.name}_${this.selectedDate.toLocaleDateString('he-IL')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      this.messageService.add({
        severity: 'success',
        summary: 'הקובץ הורד בהצלחה',
        detail: 'התור נשמר כקובץ יומן שניתן לפתוח במכשיר שלך'
      });
    }
  }
  
  showSuccessMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'תור נקבע בהצלחה',
      detail: this.addToLocalCalendar && this.downloadReady ? 
        'פרטי התור נשלחו לאימייל שלך וניתן להוריד אותם ליומן המקומי' : 
        'פרטי התור נשלחו לאימייל שלך'
    });
  }

  // בדיקה האם ניתן להמשיך לשלב הבא
  canContinue(): boolean {
    switch (this.activeIndex) {
      case 0:
        return this.selectedBusiness !== null;
      case 1:
        return this.selectedService !== null;
      case 2:
        // אם לא נדרשת בחירת ספר, תמיד ניתן להמשיך
        if (!this.showStylistSelection) return true;
        // אחרת, בדוק אם נבחר ספר
        return this.selectedStylist !== null;
      case 3:
        return this.selectedTimeSlot !== null;
      case 4:
        return true; // תמיד ניתן לאשר
      default:
        return false;
    }
  }

  // פונקציה עזר לחישוב זמן סיום
  calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  }

  // טיפול בבחירת תאריך ושעה בלוח השנה
  handleDateSelect(selectInfo: DateSelectArg) {
    console.log('נבחר תאריך:', selectInfo);
    
    // בדוק אם יש שירות נבחר
    if (!this.selectedService) {
      this.messageService.add({
        severity: 'warn',
        summary: 'שגיאה',
        detail: 'נא לבחור שירות לפני קביעת השעה'
      });
      return;
    }
    
    const startTime = selectInfo.start;
    const serviceDuration = this.selectedService.duration || 30;
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000);
    
    // שמירת המידע על השעה שנבחרה
    this.selectedSlotInfo = {
      date: startTime,
      startTime: startTime.toTimeString().substring(0, 5),
      endTime: endTime.toTimeString().substring(0, 5)
    };
    
    this.selectedSlotId = `slot-${startTime.getTime()}`;
    this.selectedDate = new Date(startTime);
    this.selectedTimeSlot = {
      id: this.selectedSlotId,
      time: startTime.toTimeString().substring(0, 5),
      available: true
    };
    
    // הוספת אירוע חדש בלוח השנה
    const events = [...this.calendarOptions.events as EventInput[]];
    events.push({
      id: this.selectedSlotId,
      title: 'נבחר',
      start: startTime,
      end: endTime,
      backgroundColor: '#2196F3',
      borderColor: '#2196F3',
      textColor: '#ffffff'
    });
    
    this.calendarOptions.events = events;
    
    this.messageService.add({
      severity: 'success',
      summary: 'תור נבחר',
      detail: `בחרת תור לתאריך ${startTime.toLocaleDateString('he-IL')} בשעה ${startTime.toTimeString().substring(0, 5)}`
    });
  }
  
  // טיפול בלחיצה על אירוע בלוח השנה
  handleEventClick(eventInfo: any) {
    const slotId = eventInfo.event.id;
    
    // אם כבר בחרנו את השעה הזו, בטל את הבחירה
    if (this.selectedSlotId === slotId) {
      this.selectedSlotInfo = null;
      this.selectedSlotId = null;
      this.selectedTimeSlot = null;
      
      // עדכון חזותי - החזרת הצבע לירוק (פנוי)
      const index = this.availableSlots.findIndex(slot => slot.id === slotId);
      if (index !== -1) {
        this.calendarOptions.events = [...this.availableSlots];
      }
      
      this.messageService.add({
        severity: 'info',
        summary: 'ביטול בחירה',
        detail: 'ביטלת את בחירת השעה'
      });
      return;
    }
    
    // בחירת שעה חדשה
    const slotInfo = this.availableSlots.find(slot => slot.id === slotId);
    if (slotInfo && slotInfo.extendedProps && slotInfo.extendedProps['available']) {
      const startTime = new Date(slotInfo.start as string);
      const serviceDuration = this.selectedService?.duration || 30;
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);
      
      this.selectedSlotInfo = {
        date: startTime,
        startTime: startTime.toTimeString().substring(0, 5),
        endTime: endTime.toTimeString().substring(0, 5)
      };
      
      this.selectedSlotId = slotId;
      this.selectedDate = new Date(startTime);
      this.selectedTimeSlot = {
        id: slotId,
        time: startTime.toTimeString().substring(0, 5),
        available: true
      };
      
      // עדכון חזותי של הלוח - סימון השעה שנבחרה
      const events = [...this.availableSlots.filter(slot => slot.id !== slotId)];
      events.push({
        id: slotId,
        title: 'נבחר',
        start: startTime,
        end: endTime,
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
        textColor: '#ffffff'
      });
      
      this.calendarOptions.events = events;
      
      this.messageService.add({
        severity: 'success',
        summary: 'תור נבחר',
        detail: `בחרת תור לתאריך ${startTime.toLocaleDateString('he-IL')} בשעה ${startTime.toTimeString().substring(0, 5)}`
      });
    }
  }

  generateTimeSlots() {
    // כאן נייצר חלונות זמן לתאריך הנבחר
    this.availableTimeSlots = [];
    
    // שעות פעילות העסק (לדוגמה)
    const startHour = 9;
    const endHour = 19;
    
    // יצירת חלונות זמן של 30 דקות
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // 70% מהשעות זמינות (אקראי לדוגמה)
        if (Math.random() > 0.3) {
          this.availableTimeSlots.push({
            id: `ts-${hour}-${minute}`,
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            available: true
          });
        }
      }
    }
  }
} 