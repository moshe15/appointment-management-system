import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/client-dashboard.component')
          .then(c => c.ClientDashboardComponent)
      },
      {
        path: 'appointments',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/appointments/appointments-list/appointments-list.component')
              .then(c => c.AppointmentsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./components/appointments/new-appointment/new-appointment.component')
              .then(c => c.NewAppointmentComponent)
          },
          {
            path: 'history',
            loadComponent: () => import('./components/appointments/appointment-history/appointment-history.component')
              .then(c => c.AppointmentHistoryComponent)
          }
        ]
      }
    ]
  }
]; 