import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, UserType } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    RadioButtonModule,
    CardModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="register-container">
      <p-toast></p-toast>
      
      <p-card class="register-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>הרשמה</h2>
          </div>
        </ng-template>
        
        <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
          <div class="p-fluid">
            <div class="field">
              <label for="name">שם מלא</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                class="w-full"
                placeholder="הכנס שם מלא"
              >
              <small
                *ngIf="registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched"
                class="p-error">
                נדרש שם מלא
              </small>
            </div>

            <div class="field">
              <label for="email">דואר אלקטרוני</label>
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
                class="w-full"
                placeholder="הכנס דואר אלקטרוני"
              >
              <small
                *ngIf="registrationForm.get('email')?.errors?.['required'] && registrationForm.get('email')?.touched"
                class="p-error">
                נדרש דואר אלקטרוני
              </small>
              <small
                *ngIf="registrationForm.get('email')?.errors?.['email'] && registrationForm.get('email')?.touched"
                class="p-error">
                יש להכניס כתובת דואר אלקטרוני תקינה
              </small>
            </div>
            
            <div class="field">
              <label for="password">סיסמה</label>
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                [feedback]="true"
                [strongRegex]="'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'"
                promptLabel="הכנס סיסמה"
                weakLabel="חלשה"
                mediumLabel="בינונית"
                strongLabel="חזקה"
                placeholder="הכנס סיסמה"
              ></p-password>
              <small
                *ngIf="registrationForm.get('password')?.invalid && registrationForm.get('password')?.touched"
                class="p-error">
                נדרשת סיסמה באורך 8 תווים לפחות
              </small>
            </div>
            
            <div class="field">
              <label>סוג משתמש</label>
              <div class="user-type-selection">
                <p-radioButton
                  name="userType"
                  value="client"
                  formControlName="userType"
                  inputId="client"
                ></p-radioButton>
                <label for="client" class="radio-label">לקוח</label>
                
                <p-radioButton
                  name="userType"
                  value="business"
                  formControlName="userType"
                  inputId="business"
                ></p-radioButton>
                <label for="business" class="radio-label">בעל עסק</label>
              </div>
              <small
                *ngIf="registrationForm.get('userType')?.invalid && registrationForm.get('userType')?.touched"
                class="p-error">
                יש לבחור סוג משתמש
              </small>
            </div>
            
            <div class="buttons mt-4">
              <button
                pButton
                type="submit"
                label="הרשמה"
                [disabled]="registrationForm.invalid || loading"
                [loading]="loading"
                class="p-button-primary"
              ></button>
            </div>
            
            <div class="signin-link mt-3">
              <p>כבר יש לך חשבון? <a routerLink="/auth/login">התחברות</a></p>
            </div>
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 20px;
      direction: rtl;
    }
    
    .register-card {
      width: 100%;
      max-width: 500px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    .card-header {
      text-align: center;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 12px 12px 0 0;
    }
    
    .card-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.75rem;
    }
    
    .field {
      margin-bottom: 1.5rem;
    }
    
    .user-type-selection {
      display: flex;
      gap: 2rem;
      margin-top: 0.5rem;
    }
    
    .radio-label {
      margin-right: 0.5rem;
    }
    
    .signin-link {
      text-align: center;
    }
    
    :host ::ng-deep .p-password {
      width: 100%;
    }
    
    .buttons {
      display: flex;
      justify-content: center;
    }
  `
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      userType: ['client', Validators.required]
    });
  }
  
  ngOnInit(): void {
  }
  
  onSubmit() {
    if (this.registrationForm.invalid) {
      return;
    }
    
    const { email, password, name, userType } = this.registrationForm.value;
    
    this.loading = true;
    this.authService.register(
      { email, name },
      password,
      userType === 'client' ? UserType.CLIENT : UserType.BUSINESS
    ).subscribe({
      next: (response) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'הרשמה הצליחה!',
          detail: 'ברוכים הבאים למערכת ניהול התורים!'
        });
        
        // ניתוב לדף המתאים לפי סוג המשתמש
        setTimeout(() => {
          if (response.type === UserType.CLIENT) {
            this.router.navigate(['/client']);
          } else {
            this.router.navigate(['/business']);
          }
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה בהרשמה',
          detail: error || 'אירעה שגיאה בהרשמה. אנא נסה שוב מאוחר יותר.'
        });
      }
    });
  }
} 