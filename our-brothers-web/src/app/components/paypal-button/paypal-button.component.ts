import { Component, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { PayPalOrder } from 'models';

declare var paypal: any;

export interface CreateOrder {
  amount: string;
}

interface OnApproveData {
  orderID: string;
  payerID: string;
  facilitatorAccessToken: string;
}

@Component({
  selector: 'app-paypal-button',
  templateUrl: './paypal-button.component.html',
  styleUrls: ['./paypal-button.component.scss']
})
export class PaypalButtonComponent implements AfterViewInit {
  @Input() amount: string;
  @Output() createOrder = new EventEmitter<CreateOrder>();
  @Output() approve = new EventEmitter<PayPalOrder>();
  @Output() cancel = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  private orderAmmount: string;

  constructor() {}

  ngAfterViewInit(): void {
    if (paypal) {
      paypal
        .Buttons({
          createOrder: (data, actions) => {
            this.orderAmmount = this.amount;
            this.createOrder.emit({ amount: this.orderAmmount });

            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  amount: {
                    value: this.orderAmmount,
                    currency_code: 'ILS'
                  }
                }
              ]
            });
          },
          onApprove: (data: OnApproveData, actions) => {
            this.approve.emit({
              payerId: data.payerID,
              orderId: data.orderID,
              amount: this.orderAmmount
            });
          },
          onCancel: data => {
            this.cancel.emit(data);
          },
          onError: error => {
            this.error.emit(error);
          }
        })
        .render('#paypal-button-container');
    }
  }
}
