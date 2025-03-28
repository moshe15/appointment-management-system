import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';
import { AppointmentBookingComponent } from './components/appointment-booking/appointment-booking.component';

const routes: Routes = [
  { path: 'dashboard', component: ClientDashboardComponent },
  { path: 'book', component: AppointmentBookingComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { } 