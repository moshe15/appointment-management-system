import { Routes } from '@angular/router';
import { CLIENT_ROUTES } from './client/client.routes';
import { BUSINESS_ROUTES } from './business/business.routes';
import { authRoutes } from './auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { TestComponent } from './test.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'client',
    canActivate: [authGuard],
    children: CLIENT_ROUTES
  },
  {
    path: 'business',
    canActivate: [authGuard],
    children: BUSINESS_ROUTES
  },
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'test',
    component: TestComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
