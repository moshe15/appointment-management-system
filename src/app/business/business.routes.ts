import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/business-dashboard.component').then(m => m.BusinessDashboardComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./components/services/services-management.component').then(m => m.ServicesManagementComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./components/appointments/appointments-management.component').then(m => m.AppointmentsManagementComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./components/clients/clients-management.component').then(m => m.ClientsManagementComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/business-settings.component').then(m => m.BusinessSettingsComponent)
      }
    ]
  }
]; 