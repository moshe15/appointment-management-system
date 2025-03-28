import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppModule } from './app/app.module';

// הגדר את ספקי השירותים והנתיבים הדרושים
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
    ]),
    provideAnimations(),
    ...appConfig.providers
  ]
}).catch(err => console.error(err)); 