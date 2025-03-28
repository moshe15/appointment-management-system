import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../../auth/services/auth.service';

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
      <h1 class="text-center mb-4">דשבורד ניהול העסק</h1>
      
      <!-- סטטיסטיקה מהירה -->
      <div class="grid">
        <div class="col-12 md:col-3">
          <p-card styleClass="stats-card">
            <div class="stat-content">
              <div class="stat-value">{{todayAppointments}}</div>
              <div class="stat-label">תורים להיום</div>
            </div>
            <div class="stat-icon">
              <i class="pi pi-calendar-plus"></i>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-3">
          <p-card styleClass="stats-card">
            <div class="stat-content">
              <div class="stat-value">{{pendingRequests}}</div>
              <div class="stat-label">בקשות ממתינות</div>
            </div>
            <div class="stat-icon">
              <i class="pi pi-bell"></i>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-3">
          <p-card styleClass="stats-card">
            <div class="stat-content">
              <div class="stat-value">{{totalClients}}</div>
              <div class="stat-label">סה"כ לקוחות</div>
            </div>
            <div class="stat-icon">
              <i class="pi pi-users"></i>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-3">
          <p-card styleClass="stats-card">
            <div class="stat-content">
              <div class="stat-value">{{totalServices}}</div>
              <div class="stat-label">סה"כ שירותים</div>
            </div>
            <div class="stat-icon">
              <i class="pi pi-list"></i>
            </div>
          </p-card>
        </div>
      </div>
      
      <!-- גרף ותורים להיום -->
      <div class="grid mt-4">
        <div class="col-12 md:col-8">
          <p-card header="סיכום תורים - חודש אחרון" styleClass="chart-card">
            <div class="chart-container">
              <canvas id="appointmentsChart"></canvas>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-4">
          <p-card header="תורים להיום" styleClass="appointments-card">
            <div *ngIf="todayAppointments === 0" class="empty-appointments">
              <p>אין תורים מתוכננים להיום</p>
            </div>
            
            <ul class="appointment-list" *ngIf="todayAppointments > 0">
              <li>
                <div class="appointment-time">10:00</div>
                <div class="appointment-details">
                  <div class="appointment-client">ישראל ישראלי</div>
                  <div class="appointment-service">תספורת גברים</div>
                </div>
              </li>
              <li>
                <div class="appointment-time">12:30</div>
                <div class="appointment-details">
                  <div class="appointment-client">יעל כהן</div>
                  <div class="appointment-service">צביעת שיער</div>
                </div>
              </li>
              <li>
                <div class="appointment-time">15:45</div>
                <div class="appointment-details">
                  <div class="appointment-client">משה לוי</div>
                  <div class="appointment-service">תספורת וזקן</div>
                </div>
              </li>
            </ul>
            
            <div class="text-center mt-3">
              <button pButton label="צפייה בכל התורים" icon="pi pi-calendar" routerLink="/business/appointments" class="p-button-outlined"></button>
            </div>
          </p-card>
        </div>
      </div>
      
      <!-- אפשרויות ניהול -->
      <div class="grid mt-4">
        <div class="col-12 md:col-3">
          <p-card styleClass="menu-card">
            <div class="menu-card-content">
              <i class="pi pi-calendar menu-icon"></i>
              <h3>ניהול תורים</h3>
              <p>צפייה וניהול בתורים, אישור בקשות</p>
              <button pButton label="לניהול תורים" routerLink="/business/appointments" class="p-button-primary"></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-3">
          <p-card styleClass="menu-card">
            <div class="menu-card-content">
              <i class="pi pi-list menu-icon"></i>
              <h3>ניהול שירותים</h3>
              <p>הוספה, עריכה ומחיקה של שירותים</p>
              <button pButton label="לניהול שירותים" routerLink="/business/services" class="p-button-primary"></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-3">
          <p-card styleClass="menu-card">
            <div class="menu-card-content">
              <i class="pi pi-users menu-icon"></i>
              <h3>ניהול לקוחות</h3>
              <p>צפייה בלקוחות והיסטוריית תורים</p>
              <button pButton label="לניהול לקוחות" routerLink="/business/clients" class="p-button-primary"></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-3">
          <p-card styleClass="menu-card">
            <div class="menu-card-content">
              <i class="pi pi-cog menu-icon"></i>
              <h3>הגדרות עסק</h3>
              <p>עריכת פרטי העסק, שעות פעילות</p>
              <button pButton label="להגדרות" routerLink="/business/settings" class="p-button-primary"></button>
            </div>
          </p-card>
        </div>
      </div>
      
      <div class="text-center mt-4">
        <button pButton label="התנתקות" icon="pi pi-sign-out" (click)="logout()" class="p-button-secondary"></button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .stats-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #3B82F6;
    }
    
    .stat-label {
      font-size: 1rem;
      color: #64748B;
    }
    
    .stat-icon {
      font-size: 2.5rem;
      color: #93C5FD;
    }
    
    .chart-container {
      height: 300px;
    }
    
    .empty-appointments {
      text-align: center;
      color: #64748B;
      padding: 20px 0;
    }
    
    .appointment-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .appointment-list li {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    
    .appointment-time {
      background-color: #EFF6FF;
      color: #3B82F6;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      min-width: 60px;
      text-align: center;
      margin-left: 10px;
    }
    
    .appointment-details {
      flex: 1;
    }
    
    .appointment-client {
      font-weight: bold;
    }
    
    .appointment-service {
      color: #64748B;
      font-size: 0.9rem;
    }
    
    .menu-card {
      height: 100%;
    }
    
    .menu-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .menu-icon {
      font-size: 2.5rem;
      color: #3B82F6;
      margin-bottom: 10px;
    }
    
    .menu-card-content h3 {
      margin-bottom: 10px;
    }
    
    .menu-card-content p {
      color: #64748B;
      margin-bottom: 15px;
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 10px;
      }
      
      .stat-value {
        font-size: 1.5rem;
      }
      
      .stat-icon {
        font-size: 2rem;
      }
      
      .chart-container {
        height: 200px;
      }
    }
  `]
})
export class BusinessDashboardComponent {
  // דמו נתונים
  todayAppointments: number = 3;
  pendingRequests: number = 2;
  totalClients: number = 45;
  totalServices: number = 12;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // כאן ניתן להוסיף את האתחול של הגרף
    // לדוגמה עם Chart.js
  }
  
  logout() {
    this.authService.signOut();
  }
} 