import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, UserType } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    CheckboxModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="login-container">
      <p-toast></p-toast>

      <p-card class="login-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>התחברות</h2>
          </div>
        </ng-template>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="p-fluid">
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
                *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                class="p-error">
                נדרש דואר אלקטרוני
              </small>
            </div>
            
            <div class="field">
              <label for="password">סיסמה</label>
              <p-password
                id="password"
                [toggleMask]="true"
                formControlName="password"
                [feedback]="false"
                placeholder="הכנס סיסמה"
              ></p-password>
              <small 
                *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                class="p-error">
                נדרשת סיסמה
              </small>
            </div>
            
            <div class="field-checkbox">
              <p-checkbox
                inputId="rememberMe"
                [binary]="true"
                formControlName="rememberMe"
              ></p-checkbox>
              <label for="rememberMe">זכור אותי</label>
            </div>
            
            <div class="buttons mt-4">
              <button
                pButton
                type="submit"
                label="התחברות"
                [disabled]="loginForm.invalid || loading"
                [loading]="loading"
                class="p-button-primary"
              ></button>
            </div>
            
            <div class="register-link mt-3">
              <p>אין לך חשבון? <a routerLink="/auth/register">הירשם עכשיו</a></p>
            </div>
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 20px;
      direction: rtl;
    }
    
    .login-card {
      width: 100%;
      max-width: 450px;
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
    
    .field-checkbox {
      margin: 1rem 0;
      display: flex;
      align-items: center;
    }
    
    .field-checkbox label {
      margin-right: 0.5rem;
    }
    
    .buttons {
      display: flex;
      justify-content: center;
    }
    
    .register-link {
      text-align: center;
    }
    
    :host ::ng-deep .p-password {
      width: 100%;
    }
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }
  
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    
    const { email, password } = this.loginForm.value;
    
    this.loading = true;
    this.authService.login(email, password).subscribe({
      next: (response: {type: UserType}) => {
        this.loading = false;
        
        // ניתוב לדף המתאים לפי סוג המשתמש
        if (response.type === UserType.CLIENT) {
          this.router.navigateByUrl('/client');
        } else {
          this.router.navigateByUrl('/business');
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאת התחברות',
          detail: 'שם משתמש או סיסמה שגויים'
        });
      }
    });
  }
} 