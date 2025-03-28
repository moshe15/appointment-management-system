import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { NewAppointmentComponent } from './client/components/appointments/new-appointment/new-appointment.component';

// Shared modules
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { GoogleCalendarService } from './core/services/google-calendar.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AppointmentsDataService } from './core/services/appointments-data.service';
import { CalendarComponent } from './components/calendar/calendar.component';

@NgModule({
  declarations: [
    // AppComponent נמחק מכאן כי הוא standalone
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      { path: '', component: NewAppointmentComponent },
      { path: 'new-appointment', component: NewAppointmentComponent },
      { path: 'client', redirectTo: '', pathMatch: 'full' }
    ]),
    AppRoutingModule,
    SharedModule,
    CoreModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    StepsModule,
    ToastModule,
    CheckboxModule,
    DialogModule,
    RatingModule,
    FullCalendarModule,
    NewAppointmentComponent,
    RouterModule,
    CalendarComponent,
    AppComponent, // העברנו את AppComponent לכאן כי הוא standalone
  ],
  providers: [
    MessageService,
    GoogleCalendarService,
    AppointmentsDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    // אם PrimeNG קיים בגרסה שלך, אפשר להשתמש בזה:
    // PrimeNG.ripple = true;
  }
} 