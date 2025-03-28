import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    ChartModule
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>ברוך הבא לדאשבורד העסק שלך</h1>
        <div class="actions">
          <button pButton label="הגדרות עסק" icon="pi pi-cog" routerLink="/business/settings" class="p-button-outlined p-button-secondary"></button>
          <button pButton label="התנתק" icon="pi pi-sign-out" (click)="logout()" class="p-button-outlined p-button-danger"></button>
        </div>
      </header>

      <div class="dashboard-grid">
        <p-card styleClass="summary-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <span class="icon-bg"><i class="pi pi-calendar"></i></span>
              <h3>תורים להיום</h3>
            </div>
          </ng-template>
          <h2 class="stat-number">0</h2>
          <ng-template pTemplate="footer">
            <button pButton label="צפייה בתורים" routerLink="/business/appointments" class="p-button-text"></button>
          </ng-template>
        </p-card>

        <p-card styleClass="summary-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <span class="icon-bg"><i class="pi pi-users"></i></span>
              <h3>לקוחות</h3>
            </div>
          </ng-template>
          <h2 class="stat-number">0</h2>
          <ng-template pTemplate="footer">
            <button pButton label="ניהול לקוחות" routerLink="/business/clients" class="p-button-text"></button>
          </ng-template>
        </p-card>

        <p-card styleClass="summary-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <span class="icon-bg"><i class="pi pi-tag"></i></span>
              <h3>שירותים</h3>
            </div>
          </ng-template>
          <h2 class="stat-number">0</h2>
          <ng-template pTemplate="footer">
            <button pButton label="ניהול שירותים" routerLink="/business/services" class="p-button-text"></button>
          </ng-template>
        </p-card>

        <p-card styleClass="summary-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <span class="icon-bg"><i class="pi pi-chart-bar"></i></span>
              <h3>הכנסה חודשית</h3>
            </div>
          </ng-template>
          <h2 class="stat-number">₪0</h2>
          <ng-template pTemplate="footer">
            <button pButton label="דוחות" routerLink="/business/reports" class="p-button-text"></button>
          </ng-template>
        </p-card>
      </div>

      <div class="charts-container">
        <p-card header="התפלגות תורים לפי שירות" styleClass="chart-card">
          <div class="chart-container">
            <p class="no-data-message">אין עדיין נתונים להצגה</p>
          </div>
        </p-card>

        <p-card header="תורים לפי חודשים" styleClass="chart-card">
          <div class="chart-container">
            <p class="no-data-message">אין עדיין נתונים להצגה</p>
          </div>
        </p-card>
      </div>

      <div class="upcoming-appointments">
        <p-card header="תורים מתוכננים להיום">
          <p class="no-data-message">אין תורים מתוכננים להיום</p>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      height: 100%;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 0.5rem;
    }

    .icon-bg {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #e0f3ff;
      color: #2196f3;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      color: #666;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      margin: 0.5rem 0;
      color: #333;
      text-align: center;
    }

    .charts-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-container {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upcoming-appointments {
      margin-bottom: 2rem;
    }

    .no-data-message {
      color: #888;
      text-align: center;
      font-style: italic;
    }

    @media (max-width: 992px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-container {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 576px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BusinessDashboardComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.signOut();
  }
} 