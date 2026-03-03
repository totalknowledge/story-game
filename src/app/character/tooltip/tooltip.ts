import { Component, Input } from '@angular/core';

export type TooltipDirection = 'right' | 'left' | 'top' | 'bottom';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
})
export class Tooltip {
  @Input({ required: true }) entry!: any;
  @Input() direction: TooltipDirection = 'right';
  @Input() widthClass = 'w-56';
}