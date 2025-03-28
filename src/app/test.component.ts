import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule],
  template: `<p-calendar [(ngModel)]="date"></p-calendar>`
})
export class TestComponent {
  date: Date = new Date();
} 