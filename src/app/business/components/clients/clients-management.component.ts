import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { AuthService } from '../../../auth/services/auth.service';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointmentsCount: number;
  lastVisit: string | null;
  registrationDate: string;
}

@Component({
  selector: 'app-clients-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    TabViewModule
  ],
  template: `
    <div class="container">
      <h1 class="text-center my-4">ניהול לקוחות</h1>
      
      <div class="actions-section mb-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input type="text" pInputText [(ngModel)]="searchText" placeholder="חיפוש לקוח..." class="w-full" />
            </span>
          </div>
          <div class="col-12 md:col-6 text-right">
            <button pButton label="הוסף לקוח חדש" icon="pi pi-user-plus" (click)="showClientDialog('new')" class="p-button-primary"></button>
          </div>
        </div>
      </div>
      
      <p-card>
        <p-tabView>
          <p-tabPanel header="כל הלקוחות">
            <div class="empty-state" *ngIf="clients.length === 0">
              <p>אין לקוחות רשומים במערכת.</p>
              <button pButton label="הוסף לקוח" icon="pi pi-user-plus" (click)="showClientDialog('new')" class="p-button-outlined"></button>
            </div>
            
            <!-- טבלת לקוחות -->
            <p-table [value]="filteredClients" *ngIf="clients.length > 0" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>שם</th>
                  <th>אימייל</th>
                  <th>טלפון</th>
                  <th>מספר תורים</th>
                  <th>ביקור אחרון</th>
                  <th>תאריך הרשמה</th>
                  <th>פעולות</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-client>
                <tr>
                  <td>{{client.name}}</td>
                  <td>{{client.email}}</td>
                  <td>{{client.phone}}</td>
                  <td>{{client.appointmentsCount}}</td>
                  <td>{{client.lastVisit || 'אין ביקורים'}}</td>
                  <td>{{client.registrationDate}}</td>
                  <td>
                    <button pButton icon="pi pi-pencil" pTooltip="ערוך" (click)="showClientDialog('edit', client)" class="p-button-text p-button-sm"></button>
                    <button pButton icon="pi pi-calendar-plus" pTooltip="קבע תור" (click)="bookAppointment(client)" class="p-button-text p-button-success p-button-sm"></button>
                    <button pButton icon="pi pi-history" pTooltip="היסטוריה" (click)="viewClientHistory(client)" class="p-button-text p-button-info p-button-sm"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>
          
          <p-tabPanel header="ממתינים לאישור">
            <div class="empty-state">
              <p>אין לקוחות הממתינים לאישור</p>
            </div>
          </p-tabPanel>
          
          <p-tabPanel header="לקוחות חדשים">
            <div class="empty-state">
              <p>אין לקוחות חדשים בחודש האחרון</p>
            </div>
          </p-tabPanel>
        </p-tabView>
      </p-card>
      
      <div class="mt-4">
        <button pButton label="חזרה לדשבורד" icon="pi pi-arrow-left" routerLink="/business" class="p-button-secondary"></button>
      </div>
    </div>
    
    <!-- דיאלוג הוספת/עריכת לקוח -->
    <p-dialog 
      [(visible)]="clientDialogVisible" 
      [header]="dialogMode === 'new' ? 'הוספת לקוח חדש' : 'עריכת פרטי לקוח'" 
      [style]="{width: '500px'}"
    >
      <div class="client-form">
        <div class="field">
          <label for="name">שם מלא *</label>
          <input 
            type="text"
            pInputText
            id="name"
            [(ngModel)]="currentClient.name"
            placeholder="שם מלא"
            class="w-full"
            required
          />
        </div>
        
        <div class="field">
          <label for="email">אימייל *</label>
          <input 
            type="email"
            pInputText
            id="email"
            [(ngModel)]="currentClient.email"
            placeholder="אימייל"
            class="w-full"
            required
          />
        </div>
        
        <div class="field">
          <label for="phone">טלפון *</label>
          <input 
            type="tel"
            pInputText
            id="phone"
            [(ngModel)]="currentClient.phone"
            placeholder="טלפון"
            class="w-full"
            required
          />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="שמור" icon="pi pi-check" (click)="saveClient()" class="p-button-success"></button>
        <button pButton label="ביטול" icon="pi pi-times" (click)="clientDialogVisible = false" class="p-button-secondary"></button>
      </ng-template>
    </p-dialog>
    
    <!-- דיאלוג היסטוריית לקוח -->
    <p-dialog 
      [(visible)]="historyDialogVisible" 
      [header]="'היסטוריית לקוח - ' + (selectedClient?.name || '')" 
      [style]="{width: '700px'}"
    >
      <div class="client-history">
        <div class="empty-state" *ngIf="true">
          <p>אין היסטוריית תורים ללקוח זה</p>
        </div>
        
        <!-- טבלת היסטוריית תורים תוצג כאן כשתהיה היסטוריה -->
      </div>
    </p-dialog>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .actions-section {
      margin-bottom: 20px;
    }
    
    .empty-state {
      text-align: center;
      padding: 30px;
      color: #666;
    }
    
    .empty-state p {
      margin-bottom: 20px;
    }
    
    .field {
      margin-bottom: 1.5rem;
    }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      .actions-section button {
        margin-top: 10px;
        width: 100%;
      }
    }
  `]
})
export class ClientsManagementComponent {
  clients: Client[] = [
    {
      id: '1',
      name: 'ישראל ישראלי',
      email: 'israel@example.com',
      phone: '050-1234567',
      appointmentsCount: 3,
      lastVisit: '01/05/2023',
      registrationDate: '01/01/2023'
    },
    {
      id: '2',
      name: 'יעל כהן',
      email: 'yael@example.com',
      phone: '052-7654321',
      appointmentsCount: 1,
      lastVisit: '15/04/2023',
      registrationDate: '10/03/2023'
    },
    {
      id: '3',
      name: 'משה לוי',
      email: 'moshe@example.com',
      phone: '054-9876543',
      appointmentsCount: 0,
      lastVisit: null,
      registrationDate: '20/06/2023'
    }
  ];
  
  searchText: string = '';
  clientDialogVisible: boolean = false;
  historyDialogVisible: boolean = false;
  dialogMode: 'new' | 'edit' = 'new';
  
  currentClient: Client = this.getEmptyClient();
  selectedClient: Client | null = null;
  
  constructor(private authService: AuthService) {}
  
  get filteredClients(): Client[] {
    if (!this.searchText) {
      return this.clients;
    }
    
    const search = this.searchText.toLowerCase();
    return this.clients.filter(client => 
      client.name.toLowerCase().includes(search) || 
      client.email.toLowerCase().includes(search) || 
      client.phone.includes(search)
    );
  }
  
  getEmptyClient(): Client {
    return {
      id: '',
      name: '',
      email: '',
      phone: '',
      appointmentsCount: 0,
      lastVisit: null,
      registrationDate: new Date().toLocaleDateString('he-IL')
    };
  }
  
  showClientDialog(mode: 'new' | 'edit', client?: Client): void {
    this.dialogMode = mode;
    
    if (mode === 'new') {
      this.currentClient = this.getEmptyClient();
    } else if (client) {
      this.currentClient = { ...client };
    }
    
    this.clientDialogVisible = true;
  }
  
  saveClient(): void {
    if (!this.currentClient.name || !this.currentClient.email || !this.currentClient.phone) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }
    
    if (this.dialogMode === 'new') {
      this.currentClient.id = Date.now().toString();
      this.clients.push(this.currentClient);
    } else {
      const index = this.clients.findIndex(c => c.id === this.currentClient.id);
      if (index !== -1) {
        this.clients[index] = this.currentClient;
      }
    }
    
    this.clientDialogVisible = false;
  }
  
  bookAppointment(client: Client): void {
    // ניווט למסך קביעת תור עם הלקוח הנבחר
    alert(`קביעת תור ללקוח: ${client.name}`);
  }
  
  viewClientHistory(client: Client): void {
    this.selectedClient = client;
    this.historyDialogVisible = true;
  }
} 