import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TableModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>ברוכים הבאים לאזור האישי</h1>
        <p>כאן תוכלו לנהל את התורים והפעילויות שלכם</p>
      </div>
      
      <div class="dashboard-actions">
        <p-card styleClass="mb-4">
          <div class="card-content">
            <h2>פעולות מהירות</h2>
            <div class="action-buttons">
              <button pButton label="קביעת תור חדש" icon="pi pi-calendar-plus" routerLink="/client/appointments/new" class="p-button-primary"></button>
              <button pButton label="התורים שלי" icon="pi pi-calendar" routerLink="/client/appointments" class="p-button-secondary"></button>
              <button pButton label="היסטוריית תורים" icon="pi pi-history" routerLink="/client/appointments/history" class="p-button-secondary"></button>
            </div>
          </div>
        </p-card>
      </div>
      
      <div class="upcoming-appointments">
        <p-card header="התורים הקרובים שלי" styleClass="mb-4">
          <div class="no-appointments" *ngIf="true">
            <p>אין לך תורים קרובים כרגע</p>
            <button pButton label="קבע תור חדש" routerLink="/client/appointments/new" class="p-button-outlined"></button>
          </div>
          
          <!-- הטבלה תוצג כאשר יהיו תורים למשתמש -->
          <p-table [value]="[]" [hidden]="true" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>תאריך</th>
                <th>שעה</th>
                <th>שירות</th>
                <th>עסק</th>
                <th>פעולות</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-appointment>
              <tr>
                <td>{{appointment.date}}</td>
                <td>{{appointment.time}}</td>
                <td>{{appointment.service}}</td>
                <td>{{appointment.business}}</td>
                <td>
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"></button>
                  <button pButton icon="pi pi-times" class="p-button-text p-button-danger p-button-sm"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
      
      <div class="logout-section">
        <button pButton label="התנתקות" icon="pi pi-sign-out" class="p-button-text" (click)="logout()"></button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .header h1 {
      margin-bottom: 10px;
      color: #333;
    }
    
    .card-content h2 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }
    
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    
    .no-appointments {
      text-align: center;
      padding: 20px;
    }
    
    .no-appointments p {
      margin-bottom: 15px;
      color: #666;
    }
    
    .logout-section {
      display: flex;
      justify-content: center;
      margin-top: 30px;
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 10px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class ClientDashboardComponent {
  constructor(private authService: AuthService) {}
  
  logout(): void {
    this.authService.signOut();
  }
} 