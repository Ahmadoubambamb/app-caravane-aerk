import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Bus } from '../../../models/bus';
import { CaravaneSession } from '../../../models/caravane-session';
import { Reservation } from '../../../models/reservation';

@Component({
  selector: 'app-print-bus-list',
  imports: [DecimalPipe],
  templateUrl: './print-bus-list.html',
  styleUrl: './print-bus-list.css',
})
export class PrintBusList {
  readonly bus = input<Bus | null>(null);
  readonly session = input<CaravaneSession | null>(null);
  readonly passengers = input<Reservation[]>([]);

  print(): void {
    document.body.classList.add('printing-bus-list');
    window.onafterprint = () => document.body.classList.remove('printing-bus-list');
    window.print();
  }
}
