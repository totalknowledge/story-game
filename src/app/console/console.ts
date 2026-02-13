import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  public consoleService = inject(ConsoleService);
  public currentInput = '';

  submit() {
    if (this.currentInput.trim()) {
      this.consoleService.execute(this.currentInput);
      this.currentInput = '';
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}