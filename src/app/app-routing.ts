import { Routes } from '@angular/router';
import { NewAppointmentComponent } from './client/components/appointments/new-appointment/new-appointment.component';

export const routes: Routes = [
  { path: '', component: NewAppointmentComponent },
  { path: 'new-appointment', component: NewAppointmentComponent }
]; 