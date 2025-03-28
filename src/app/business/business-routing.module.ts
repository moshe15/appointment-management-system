import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessDashboardComponent } from './components/business-dashboard/business-dashboard.component';
import { BusinessSetupComponent } from './components/business-setup/business-setup.component';

const routes: Routes = [
  { path: 'dashboard', component: BusinessDashboardComponent },
  { path: 'setup', component: BusinessSetupComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { } 