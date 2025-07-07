import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GbsInputComponent } from 'ng-globos-core';
import { InsurantInfo } from '../../insurant-info/model/gbs-insurant-info-feature.model';
import { CodebookResponse } from '../../../http/dto/responses/codebook-response.model';
import { CommonModule } from '@angular/common';
import { InsuredLegalInfo } from './model/Insured-legal-info-feature,model';

@Component({
  selector: 'gbs-insured-legal-info-feature',
  standalone: true,
  imports: [ReactiveFormsModule, GbsInputComponent, MatIconModule, CommonModule],
  templateUrl: './gbs-insured-legal-info-feature.component.html',
  styleUrl: './gbs-insured-legal-info-feature.component.scss'
})
export class GbsInsuredLegalInfoFeatureComponent {

  @Input() contractor: InsuredLegalInfo | any = null;
  @Input() contractorType?: CodebookResponse;
  @Output() insuredLegalInfoChange: EventEmitter<InsuredLegalInfo> = new EventEmitter<InsuredLegalInfo>();

  private emitChange(): void {
    this.insuredLegalInfoChange.emit(this.contractor);
  }

  onValueChangeFirstName(firstName: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.firstName = firstName;
    this.emitChange();
  }
  
  onValueChangeLastName(lastName: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.lastName = lastName;
    this.emitChange();
  }
  
  onValueChangePassportNumber(passportNumber: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.passportNumber = passportNumber;
    this.emitChange();
  }
  
}


