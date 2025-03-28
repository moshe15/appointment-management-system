import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NewAppointmentComponent } from './client/components/appointments/new-appointment/new-appointment.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', component: NewAppointmentComponent },
      { path: 'new-appointment', component: NewAppointmentComponent },
      { path: 'client', redirectTo: '', pathMatch: 'full' }
    ]),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
