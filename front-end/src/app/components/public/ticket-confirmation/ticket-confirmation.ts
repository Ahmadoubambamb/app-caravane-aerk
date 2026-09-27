import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReservationReceipt } from '../../../models/reservation';

@Component({
  selector: 'app-ticket-confirmation',
  imports: [DecimalPipe, UpperCasePipe],
  templateUrl: './ticket-confirmation.html',
  styleUrl: './ticket-confirmation.css',
})
export class TicketConfirmation {
  readonly receipt = input.required<ReservationReceipt>();
  readonly done = output<void>();

  print(): void {
    window.print();
  }
}
