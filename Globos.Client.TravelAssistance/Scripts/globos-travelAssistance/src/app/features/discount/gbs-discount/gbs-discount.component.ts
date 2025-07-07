import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { GbsButtonComponent, GbsInputComponent } from 'ng-globos-core';
import { ButtonType } from 'ng-globos-core';
import { PolicyClientService } from '../../../http/policy-client.service';
import { CommonModule }     from '@angular/common';


@Component({
  selector: 'gbs-discount',
  standalone: true,
  imports: [GbsInputComponent, GbsButtonComponent, MatIcon, CommonModule],
  templateUrl: './gbs-discount.component.html',
  styleUrl: './gbs-discount.component.scss'
})
export class GbsDiscountComponent {
  @Input() discountCode: string = '';
  @Output() applyDiscount = new EventEmitter<void>();

  ButtonType!: ButtonType.Positive;
  showMessage: string = '';
  status: number = 0;


   constructor(
      private policyClientService: PolicyClientService) { }
  
  ngOnInit(){
    const appliedDiscountMessage= sessionStorage.getItem('appliedDiscountMessage')
    this.showMessage = appliedDiscountMessage ? appliedDiscountMessage.toString() : '';
  }
  
  applyDiscountMethod(): void {

    if (!this.discountCode?.trim()) return;

    const session = sessionStorage.getItem("step1RequestObject");
    if (session) {
      const item = JSON.parse(session);
      item.promoCode = this.discountCode;
      sessionStorage.setItem("step1RequestObject", JSON.stringify(item));
    }

    this.policyClientService.postInfooffer().subscribe(result => {
      if (result?.length) {
        const [statusStr, ...messageParts] = result[0].discountNote.split('_');
        this.status = Number(statusStr);
        this.showMessage = messageParts.join('_');
        sessionStorage.setItem('appliedDiscountMessage',this.showMessage)
      }
    });
    
    this.applyDiscount.emit();
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    this.applyDiscountMethod();
  }
}
