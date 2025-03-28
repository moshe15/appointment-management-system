import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AppointmentsDataService, Appointment } from '../../../../core/services/appointments-data.service';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    RippleModule,
    AvatarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.scss']
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading$ = new BehaviorSubject<boolean>(true);
  
  // פרטי תור נבחר
  selectedAppointment: Appointment | null = null;
  appointmentDetailsVisible = false;
  
  // פרמטרי סינון
  searchText = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  statusFilter: string | null = null;
  
  statusOptions = [
    { label: 'הכל', value: null },
    { label: 'מאושר', value: 'confirmed' },
    { label: 'ממתין', value: 'pending' },
    { label: 'בוטל', value: 'cancelled' }
  ];
  
  constructor(
    private router: Router,
    private appointmentsService: AppointmentsDataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    this.loadAppointments();
  }
  
  loadAppointments(): void {
    this.loading$.next(true);
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments) => {
        // מסנן את התורים הרלוונטים (רק כאלה שלא הושלמו וגם לא מוצגים בהיסטוריה)
        this.appointments = appointments.filter(a => 
          a.status !== 'completed' && a.status !== 'no-show'
        );
        this.filteredAppointments = [...this.appointments];
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('שגיאה בטעינת התורים', err);
        this.loading$.next(false);
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.appointments];
    
    // סינון לפי טקסט חופשי
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(app => 
        app.businessName.toLowerCase().includes(searchLower) ||
        app.serviceName.toLowerCase().includes(searchLower)
      );
    }
    
    // סינון לפי תאריך התחלה
    if (this.fromDate) {
      const fromDateObj = new Date(this.fromDate);
      fromDateObj.setHours(0, 0, 0, 0);
      filtered = filtered.filter(app => new Date(app.date) >= fromDateObj);
    }
    
    // סינון לפי תאריך סיום
    if (this.toDate) {
      const toDateObj = new Date(this.toDate);
      toDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter(app => new Date(app.date) <= toDateObj);
    }
    
    // סינון לפי סטטוס
    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }
    
    this.filteredAppointments = filtered;
  }
  
  clearFilters(): void {
    this.searchText = '';
    this.fromDate = null;
    this.toDate = null;
    this.statusFilter = null;
    this.filteredAppointments = [...this.appointments];
  }
  
  bookNewAppointment(): void {
    this.router.navigate(['/client/appointments/new']);
  }
  
  showDetails(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.appointmentDetailsVisible = true;
  }
  
  cancelAppointment(appointment: Appointment): void {
    this.confirmationService.confirm({
      message: `האם אתה בטוח שברצונך לבטל את התור ל${appointment.serviceName} ב ${this.formatDate(appointment.date instanceof Date ? appointment.date : new Date(appointment.date))}?`,
      header: 'אישור ביטול תור',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appointmentsService.cancelAppointment(appointment.id).subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success', 
                summary: 'התור בוטל',
                detail: 'התור בוטל בהצלחה'
              });
              this.loadAppointments();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', 
              summary: 'שגיאה',
              detail: 'אירעה שגיאה בעת ביטול התור'
            });
          }
        });
      }
    });
  }
  
  formatDate(date: string | Date): string {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'מאושר';
      case 'pending': return 'ממתין לאישור';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  }
  
  canCancel(appointment: Appointment): boolean {
    // ניתן לבטל תור רק אם הוא מאושר או בהמתנה
    return appointment.status === 'confirmed' || appointment.status === 'pending';
  }
  
  canReschedule(appointment: Appointment): boolean {
    // ניתן לשנות תור רק אם הוא מאושר או בהמתנה
    return appointment.status === 'confirmed' || appointment.status === 'pending';
  }
} 