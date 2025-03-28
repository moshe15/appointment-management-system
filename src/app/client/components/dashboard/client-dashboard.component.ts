import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { Appointment } from '../../../core/services/appointments-data.service';
import { AppointmentsDataService } from '../../../core/services/appointments-data.service';
import { User } from '../../../core/services/auth.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    AvatarModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section mb-4">
        <div class="user-welcome">
          <p-avatar
            icon="pi pi-user"
            size="large"
            [style]="{ 'background-color': '#2196F3', color: '#ffffff' }"
            class="mr-2"
          ></p-avatar>
          <div class="welcome-text">
            <h2>שלום, {{ currentUser?.name || 'אורח' }}</h2>
            <p>ברוכים הבאים למערכת ניהול התורים האישית שלך</p>
          </div>
        </div>
      </div>
      
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="dashboard-card">
            <div class="card-content align-items-center">
              <div class="card-icon upcoming">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="card-data">
                <h3>{{ upcomingAppointmentsCount }}</h3>
                <p>תורים קרובים</p>
              </div>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="dashboard-card">
            <div class="card-content align-items-center">
              <div class="card-icon completed">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="card-data">
                <h3>{{ completedAppointmentsCount }}</h3>
                <p>תורים שהושלמו</p>
              </div>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="dashboard-card">
            <div class="card-content align-items-center">
              <div class="card-icon pending">
                <i class="pi pi-clock"></i>
              </div>
              <div class="card-data">
                <h3>{{ pendingAppointmentsCount }}</h3>
                <p>תורים ממתינים</p>
              </div>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="dashboard-card">
            <div class="card-content align-items-center">
              <div class="card-icon businesses">
                <i class="pi pi-building"></i>
              </div>
              <div class="card-data">
                <h3>{{ uniqueBusinessesCount }}</h3>
                <p>עסקים מועדפים</p>
              </div>
            </div>
          </p-card>
        </div>
      </div>
      
      <div class="grid mt-4">
        <div class="col-12 lg:col-8">
          <p-card header="התורים הקרובים שלך" styleClass="h-full">
            <p-table
              [value]="upcomingAppointments"
              [rows]="5"
              [paginator]="true"
              styleClass="p-datatable-sm"
              [tableStyle]="{ 'min-width': '50rem' }"
              emptyMessage="אין תורים קרובים"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>עסק</th>
                  <th>שירות</th>
                  <th>תאריך</th>
                  <th>שעה</th>
                  <th>סטטוס</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-appointment>
                <tr>
                  <td>{{ appointment.businessName }}</td>
                  <td>{{ appointment.serviceName }}</td>
                  <td>{{ appointment.date | date: 'dd/MM/yyyy' }}</td>
                  <td>{{ appointment.startTime }}</td>
                  <td>
                    <p-tag
                      [value]="getStatusText(appointment.status)"
                      [severity]="getStatusClass(appointment.status)"
                    ></p-tag>
                  </td>
                </tr>
              </ng-template>
            </p-table>
            
            <div class="flex justify-content-end mt-3">
              <button
                pButton
                label="כל התורים"
                icon="pi pi-arrow-left"
                iconPos="right"
                class="p-button-text"
                routerLink="/client/appointments"
              ></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 lg:col-4">
          <p-card header="התפלגות תורים" styleClass="h-full">
            <div class="chart-container">
              <p-chart
                type="pie"
                [data]="chartData"
                [options]="chartOptions"
                height="300px"
              ></p-chart>
            </div>
            
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color confirmed"></span>
                <span class="legend-label">אושרו</span>
              </div>
              <div class="legend-item">
                <span class="legend-color completed"></span>
                <span class="legend-label">הושלמו</span>
              </div>
              <div class="legend-item">
                <span class="legend-color pending"></span>
                <span class="legend-label">ממתינים</span>
              </div>
              <div class="legend-item">
                <span class="legend-color canceled"></span>
                <span class="legend-label">בוטלו</span>
              </div>
            </div>
          </p-card>
        </div>
      </div>
      
      <div class="grid mt-4">
        <div class="col-12">
          <p-card header="פעולות מהירות" styleClass="action-card">
            <div class="actions-container">
              <button
                pButton
                label="קביעת תור חדש"
                icon="pi pi-calendar-plus"
                class="p-button-primary action-button"
                routerLink="/client/appointments/new"
              ></button>
              
              <button
                pButton
                label="היסטוריית תורים"
                icon="pi pi-history"
                class="p-button-secondary action-button"
                routerLink="/client/appointments/history"
              ></button>
              
              <button
                pButton
                label="הגדרות פרופיל"
                icon="pi pi-user-edit"
                class="p-button-help action-button"
                routerLink="/client/settings"
              ></button>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 20px;
    }
    
    .welcome-section {
      border-radius: 8px;
      background-color: #f8f9fa;
      padding: 20px;
    }
    
    .user-welcome {
      display: flex;
      align-items: center;
    }
    
    .welcome-text h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .welcome-text p {
      margin: 0;
      color: #6c757d;
    }
    
    .dashboard-card {
      height: 100%;
    }
    
    .card-content {
      display: flex;
      align-items: center;
      padding: 0.5rem;
    }
    
    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
    }
    
    .card-icon i {
      font-size: 2rem;
      color: white;
    }
    
    .card-data h3 {
      font-size: 1.8rem;
      margin: 0;
      font-weight: 600;
    }
    
    .card-data p {
      margin: 0;
      color: #6c757d;
    }
    
    .card-icon.upcoming {
      background-color: #2196F3;
    }
    
    .card-icon.completed {
      background-color: #4CAF50;
    }
    
    .card-icon.pending {
      background-color: #FF9800;
    }
    
    .card-icon.businesses {
      background-color: #9C27B0;
    }
    
    .chart-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 5px;
    }
    
    .legend-color.confirmed {
      background-color: #2196F3;
    }
    
    .legend-color.completed {
      background-color: #4CAF50;
    }
    
    .legend-color.pending {
      background-color: #FF9800;
    }
    
    .legend-color.canceled {
      background-color: #F44336;
    }
    
    .actions-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    
    .action-button {
      min-width: 200px;
    }
    
    @media (max-width: 768px) {
      .card-icon {
        width: 50px;
        height: 50px;
      }
      
      .card-icon i {
        font-size: 1.5rem;
      }
      
      .card-data h3 {
        font-size: 1.5rem;
      }
    }
  `
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  
  // Stats
  upcomingAppointmentsCount: number = 0;
  completedAppointmentsCount: number = 0;
  pendingAppointmentsCount: number = 0;
  uniqueBusinessesCount: number = 0;
  
  // Chart data
  chartData: any;
  chartOptions: any;
  
  constructor(
    private appointmentsService: AppointmentsDataService,
    private authService: AuthService
  ) {
    this.initializeChart();
  }
  
  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAppointments();
  }
  
  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }
  
  loadAppointments(): void {
    this.appointmentsService.getAppointmentsForCurrentUser().subscribe((appointments: Appointment[]) => {
      this.appointments = appointments;
      this.calculateStats();
      this.updateChartData();
      this.prepareUpcomingAppointments();
    });
  }
  
  calculateStats(): void {
    const now = new Date();
    
    // Upcoming appointments (confirmed with future dates)
    this.upcomingAppointmentsCount = this.appointments.filter(app => {
      const appDate = new Date(app.date);
      return app.status === 'confirmed' && appDate >= now;
    }).length;
    
    // Completed appointments
    this.completedAppointmentsCount = this.appointments.filter(app => 
      app.status === 'completed'
    ).length;
    
    // Pending appointments
    this.pendingAppointmentsCount = this.appointments.filter(app => 
      app.status === 'pending'
    ).length;
    
    // Unique businesses
    const uniqueBusinesses = new Set(
      this.appointments.map(app => app.businessId)
    );
    this.uniqueBusinessesCount = uniqueBusinesses.size;
  }
  
  prepareUpcomingAppointments(): void {
    const now = new Date();
    this.upcomingAppointments = this.appointments
      .filter(app => {
        const appDate = new Date(app.date);
        return (app.status === 'confirmed') && appDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5); // Get first 5 upcoming appointments
  }
  
  updateChartData(): void {
    // Count appointments by status
    const confirmedCount = this.appointments.filter(app => app.status === 'confirmed').length;
    const completedCount = this.appointments.filter(app => app.status === 'completed').length;
    const pendingCount = this.appointments.filter(app => app.status === 'pending').length;
    const canceledCount = this.appointments.filter(app => app.status === 'cancelled').length;
    
    this.chartData = {
      labels: ['אושרו', 'הושלמו', 'ממתינים', 'בוטלו'],
      datasets: [
        {
          data: [confirmedCount, completedCount, pendingCount, canceledCount],
          backgroundColor: ['#2196F3', '#4CAF50', '#FF9800', '#F44336'],
          hoverBackgroundColor: ['#1976D2', '#388E3C', '#F57C00', '#D32F2F']
        }
      ]
    };
  }
  
  initializeChart(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}`;
            }
          }
        }
      }
    };
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      case 'confirmed':
        return 'אושר';
      case 'pending':
        return 'ממתין';
      case 'no-show':
        return 'לא הגיע';
      default:
        return status;
    }
  }
  
  getStatusClass(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'confirmed':
        return 'info';
      case 'pending':
        return 'secondary';
      case 'no-show':
        return 'warn';
      default:
        return 'info';
    }
  }
} 