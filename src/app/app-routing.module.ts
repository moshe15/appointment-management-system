import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewAppointmentComponent } from './client/components/appointments/new-appointment/new-appointment.component';

export const routes: Routes = [
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) 
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'appointments/new', component: NewAppointmentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 