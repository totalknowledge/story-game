import { Component, inject, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsoleService } from './console.service';

@Component({
  selector: 'app-console',
  imports: [CommonModule, FormsModule],
  templateUrl: './console.html',
  styleUrl: './console.css'
})
export class ConsoleComponent implements AfterViewChecked {

  public consoleService = inject(ConsoleService);
  public currentInput = '';
  private channel = new BroadcastChannel('story-game');

  constructor() {
    this.channel.addEventListener('message', e => {
      if (e.data === 'focus-console') {
        this.focusInput();
      }
    });
  }

  submit() {
    const input = this.currentInput.trim();
    this.currentInput = '';
    if (input) {
      this.consoleService.execute(input);
    }
  }

  private focusInput(): void {
    const el = document.getElementById('console-input') as HTMLElement | null;
    if (el) el.focus();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const el = document.getElementById('scroll-container');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}