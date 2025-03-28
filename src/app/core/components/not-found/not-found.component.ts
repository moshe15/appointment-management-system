import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule
  ],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>הדף לא נמצא</h2>
        <p>מצטערים, אך העמוד שחיפשת אינו קיים.</p>
        <div class="actions">
          <button pButton icon="pi pi-home" label="חזרה לדף הבית" routerLink="/"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
      background-color: #f5f5f5;
    }
    
    .not-found-content {
      padding: 2rem;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
    }
    
    h1 {
      font-size: 6rem;
      margin: 0;
      color: #ff4757;
    }
    
    h2 {
      font-size: 2rem;
      margin: 0.5rem 0;
      color: #333;
    }
    
    p {
      margin: 1rem 0 2rem;
      color: #666;
    }
    
    .actions {
      display: flex;
      justify-content: center;
    }
  `]
})
export class NotFoundComponent {
} 