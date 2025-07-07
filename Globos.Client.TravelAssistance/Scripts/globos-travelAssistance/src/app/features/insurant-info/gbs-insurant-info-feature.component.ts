import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GbsInputComponent, GbsCheckboxComponent, GbsDatePickerComponent } from 'ng-globos-core';
import { InsurantInfo } from './model/gbs-insurant-info-feature.model';
import { CodebookResponse } from '../../http/dto/responses/codebook-response.model';
import { CommonModule } from '@angular/common';
import { ClientValidationService } from '../../validations/client-validation/client-validation.service';
import { AllValidationsDirective } from '../../validations/client-validation/allValidations';
import { LettersOnlyDirective } from '../../validations/client-validation/letters-only.directive';
import { foreignCitizenData } from '../contractor-info/model/gbs-contractor-info.model';

@Component({
  selector: 'gbs-insurant-info-feature',
  standalone: true,
  imports: [ReactiveFormsModule, GbsInputComponent, MatIconModule, CommonModule, LettersOnlyDirective, AllValidationsDirective, GbsCheckboxComponent, GbsDatePickerComponent],
  templateUrl: './gbs-insurant-info-feature.component.html',
  styleUrl: './gbs-insurant-info-feature.component.scss'
})
export class GbsInsurantInfoFeatureComponent implements OnChanges {

  @Input() contractor: InsurantInfo | any = null;
  @Input() isInsuredContractorShared: boolean = false;
  @Input() contractorType?: CodebookResponse;
  @Input() insurantId!: string;
  @Input() textAges: string = '';
  @Input() allJmbgs: string[] = [];
  @Input() contractorJmbg: string = '';
  @Input() foreignCitizenDataInput?: foreignCitizenData;


  @Input() insurantIndex!: number;

  @Output() insurantInfoChange = new EventEmitter<InsurantInfo>();

  @Output() foreignCitizenOutput = new EventEmitter<{index: number, data: foreignCitizenData }>();

  maxSelectableDate: any;

  disableFutureDates = (d: Date | null): boolean => {
    if (!d) return false;
    const today = new Date();
    const noTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < noTime;    
  };

  foreignCitizenList: foreignCitizenData[]=[]
  
  foreignCitizenData: foreignCitizenData = {
    foreignCitizen: false,
    foreignRNYesNo: false,
    foreignRegistrationNumber: ''
  };

  foreignCitizen: boolean = false;
  YesNoJMBG: boolean = false;
  dateForeignBirthText: any;
  dateForeignBirth: any;

  constructor(private validationJMBG: ClientValidationService) { }

  ngOnInit(): void {
    const saved = sessionStorage.getItem(`contractorData_${this.insurantIndex}`);
    if (saved) {
      this.contractor = JSON.parse(saved);
      this.emitChange();
    }

    if (this.foreignCitizenDataInput) {
      this.foreignCitizenData = { ...this.foreignCitizenDataInput };
      this.foreignCitizen = this.foreignCitizenData.foreignCitizen ?? false;
      this.YesNoJMBG = this.foreignCitizenData.foreignRNYesNo ?? false;
      this.dateForeignBirth = this.foreignCitizenData.dateForeignBirth ?? null;
  
      if (this.dateForeignBirth) {
        const date = new Date(this.dateForeignBirth);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        this.dateForeignBirthText = `${day}${month}${year.slice(1)}000000`;
      }
    }

    const today = new Date();
    this.maxSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['isInsuredContractorShared']) {
      if (this.isInsuredContractorShared) {
        this.emitChange();
      }
    }
  }


  private emitChange(): void {
    this.insurantInfoChange.emit(this.contractor);
  }


  private emitChangeForeign(): void {
 
    this.foreignCitizenOutput.emit({ index: this.insurantIndex, data: structuredClone(this.foreignCitizenData) });
  }


  private saveToSession() {
    sessionStorage.setItem(`contractorData_${this.insurantIndex}`, JSON.stringify(this.contractor));
  }

  onValueChangeRegistrationNumber(registrationNumber: any) {
    if (this.contractor == null) {
      this.contractor = {}
    }

    if (this.contractor != null) {

      this.contractor.registrationNumber = registrationNumber;
      if (!registrationNumber || registrationNumber.length !== 13) {
        this.contractor.birthDate = '';
        return;
      }
      const result = this.validationJMBG.isValidJMBG(registrationNumber);
      if (!result) {
        this.contractor.birthDate = '';
        return;
      }
      const datum = this.validationJMBG.calculateBirthdateFromJMBG(registrationNumber);
      this.contractor.birthDate = datum ?? '';
      // console.log(this.contractor, 'sta je contractor')

      this.saveToSession();

      this.emitChange();
    }
  }

  onValueChangeFirstName(firstName: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.firstName = firstName;
    this.saveToSession();
    this.emitChange();
  }

  onValueChangeLastName(lastName: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.lastName = lastName;
    this.saveToSession();
    this.emitChange();
  }

  onValueChangePassportNumber(passportNumber: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.passportNumber = passportNumber;
    this.saveToSession();
    this.emitChange();
  }

  foreignCitizenChange(event: any) {
    this.foreignCitizen = event;
    this.foreignCitizenData.foreignCitizen = this.foreignCitizen

    if( this.foreignCitizen ==false){
      this.YesNoJMBG = false;
    }
    
    this.emitChangeForeign()
    // sessionStorage.setItem('foreignCitizen', JSON.stringify(this.foreignCitizenData));
  }

  YesNoJMBGChange(event: any) {
    this.YesNoJMBG = event;

    this.foreignCitizenData.foreignRNYesNo = this.YesNoJMBG

    if (this.YesNoJMBG == false) {
      this.onValueChangeRegistrationNumber("")
      this.dateForeignBirthText = ''
      this.dateForeignBirth = null
      this.foreignCitizenData.foreignRegistrationNumber = ''
      this.foreignCitizenData.dateForeignBirth = undefined
    }

    if (this.YesNoJMBG == true) {
      this.dateForeignBirth = null
      // sessionStorage.removeItem('foreignCitizen')
    }

    this.emitChangeForeign()
    // sessionStorage.setItem('foreignCitizen', JSON.stringify(this.foreignCitizenData));
  }

  onValueChangeDateForeignBirth(event: any) {
    this.dateForeignBirthText = event;
    this.dateForeignBirth = event;

    const date = new Date(event);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    this.dateForeignBirthText = `${day}${month}${year.slice(1)}000000`;

    this.foreignCitizenData.foreignRegistrationNumber = this.dateForeignBirthText
    this.foreignCitizenData.dateForeignBirth = this.dateForeignBirth
    // sessionStorage.setItem('foreignCitizen', JSON.stringify(this.foreignCitizenData));

    this.onValueChangeRegistrationNumber(this.dateForeignBirthText)

    this.emitChangeForeign()
  }


}
