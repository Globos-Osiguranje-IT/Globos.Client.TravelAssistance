import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientValidationService } from '../../validations/client-validation/client-validation.service';
import { GbsCheckboxComponent, GbsDropdownComponent, GbsInputComponent, GbsDatePickerComponent } from 'ng-globos-core';
import { City, CityAutoComplete, Client, ContractorInfo, foreignCitizenData } from './model/gbs-contractor-info.model';
import { MatIconModule } from '@angular/material/icon';
import { CodebookResponse } from '../../http/dto/responses/codebook-response.model';
import { CommonModule } from '@angular/common';
import { InsuredAgeGroupMap } from '../../enums';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { GbsAutocompleteComponent } from "ng-globos-core";
import { InsurantInfo } from '../insurant-info/model/gbs-insurant-info-feature.model';
import { AllValidationsDirective } from '../../validations/client-validation/allValidations';
import { LettersOnlyDirective } from '../../validations/client-validation/letters-only.directive';

@Component({
  selector: 'gbs-contractor-info-feature',
  standalone: true,
  imports: [ReactiveFormsModule, GbsInputComponent, MatIconModule, CommonModule, FormsModule, AllValidationsDirective, GbsAutocompleteComponent,
    LettersOnlyDirective, GbsCheckboxComponent, GbsDatePickerComponent],
  templateUrl: './gbs-contractor-info-feature.component.html',
  styleUrl: './gbs-contractor-info-feature.component.scss'
})

export class GbsContractorInfoFeatureComponent implements OnInit {

  @Input() isInsuredContractorShared: boolean = false;
  @Input() contractor: ContractorInfo | any = null;
  @Input() contractorType?: CodebookResponse;
  @Input() client?: Client;
  @Input() items_city: CityAutoComplete[] = [];
  @Input() selectedValue_city: CityAutoComplete = new CityAutoComplete();
  @Input() allJmbgs: string[] = [];
  @Input() contractorJmbg: string = '';
  @Output() contractorInfoChange = new EventEmitter<ContractorInfo>();
  @Output() contractorMappedToInsurantInfo = new EventEmitter<InsurantInfo>();

  @Input() insurantIndex!: number;
  @Input() foreignCitizenDataInput?: foreignCitizenData;


  maxSelectableDate: any;
  disableFutureDates = (d: Date | null): boolean => {
    if (!d) return false;
    const today = new Date();
    const noTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < noTime;     
  };

  foreignCitizenData: foreignCitizenData = {
    foreignCitizen: false,
    foreignRNYesNo: false,
    foreignRegistrationNumber: ''
  };

  jmbg: string = "";
  ageGroup = InsuredAgeGroupMap;
  city: City[] = [];
  items = InsuredAgeGroupMap;
  isInsuredContractor: boolean = false;
  foreignCitizen: boolean = false;
  YesNoJMBG: boolean = false;
  dateForeignBirthText: any;
  dateForeignBirth: any;
  @Output() insuredContractorChange = new EventEmitter<boolean>();


  constructor(private validationService: ClientValidationService,
    private cashedSessionService: CashedCodebookClientService) { }

  ngOnInit(): void {
    if (this.isInsuredContractorShared) {
      this.onToggleIsInsuredContractor(true);
    }

    const foreignCitizenSession = sessionStorage.getItem('foreignCitizen');
    const foreignCitizen: foreignCitizenData =
      foreignCitizenSession ?
        JSON.parse(foreignCitizenSession) :
        {
          foreignCitizen: false,
          foreignRNYesNo: false,
          foreignRegistrationNumber: ''
        };


    this.foreignCitizen = foreignCitizen.foreignCitizen ?? false;
    this.YesNoJMBG = foreignCitizen.foreignRNYesNo ?? false;
    this.dateForeignBirthText = foreignCitizen.foreignRegistrationNumber;
    this.dateForeignBirth = foreignCitizen.dateForeignBirth;


    const today = new Date();
    this.maxSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isInsuredContractorShared']) {
      // console.log("Nova vrednost došla iz roditelja:", this.isInsuredContractorShared);
      this.isInsuredContractor = this.isInsuredContractorShared
    }
  }




  private emitMappedInsurantInfo(): void {
    if (!this.contractor) return;

    const mappedInsurant: InsurantInfo = {
      registrationNumber: this.contractor.registrationNumber || '',
      firstName: this.contractor.firstName || '',
      lastName: this.contractor.lastName || '',
      passportNumber: this.contractor.passportNumber || '',
      birthDate: this.contractor.dateBirth || '',
    };
    this.contractorMappedToInsurantInfo.emit(mappedInsurant);
  }


  onToggleIsInsuredContractor(newValue: boolean) {
    this.isInsuredContractor = newValue;
    this.insuredContractorChange.emit(this.isInsuredContractor);

    // if (this.isInsuredContractor) {
    this.emitMappedInsurantInfo();
    // }
  }



  private emitChange(): void {
    this.contractorInfoChange.emit(this.contractor);
  }

  onSelectedChangeCity(event: any) {
    this.selectedValue_city = event;
    // console.log(event)
    // console.log("SELECTED CITY: ", this.selectedValue_city)

    sessionStorage.removeItem('selectedCity');
    sessionStorage.setItem('selectedCity', JSON.stringify(this.selectedValue_city));

    if (this.contractor == null) {
      this.contractor = {}
    }
    this.contractor.cityId = this.selectedValue_city.value;
    this.emitChange();

  }

  onValueChangeRegistrationNumber(registrationNumber: any) {

    if (this.contractor == null) {
      this.contractor = {}
    }

    if (this.contractor != null) {

      this.contractor.registrationNumber = registrationNumber;
      if (!registrationNumber || registrationNumber.length !== 13) {
        this.contractor.dateBirth = '';
        return;
      }
      const result = this.validationService.isValidJMBG(registrationNumber);
      if (!result && !this.foreignCitizen) {
        // latinOnFocusOutDirectiveshowError('Morate uneti latinicu.');
        this.contractor.dateBirth = '';
        return;
      }
      const datum = this.validationService.calculateBirthdateFromJMBG(registrationNumber);
      this.contractor.dateBirth = datum ?? '';
      // console.log(this.contractor, 'sta je contractor')

      this.emitChange();
    }
  }

  onValueChangeTaxIdentificationNumber(taxIdentificationNumber: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.taxIdentificationNumber = taxIdentificationNumber;
    this.emitChange();
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

  onValueChangeCityName(cityName: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.cityName = cityName;
    this.emitChange();
  }

  onValueChangeCompanyName(companyName: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.companyName = companyName;
    this.emitChange();
  }

  onValueChangeStreet(street: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.street = street;
    this.emitChange();
  }

  onValueChangeHouseNumber(houseNumber: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.houseNumber = houseNumber;
    this.emitChange();
  }

  onValueChangeMobileNumber(mobileNumber: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.mobileNumber = mobileNumber;
    this.emitChange();
  }

  onValueChangeEmail(email: string): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.email = email;
    this.emitChange();
  }

  onValueChangeAgeGroup(ageGroup: any): void {
    if (!this.contractor) {
      this.contractor = {};
    }
    this.contractor.ageGroup = ageGroup;
    this.emitChange();
  }


  foreignCitizenChange(event: any) {
    this.foreignCitizen = event;
    this.foreignCitizenData.foreignCitizen = this.foreignCitizen
    sessionStorage.setItem('foreignCitizen', JSON.stringify(this.foreignCitizenData));

    if( this.foreignCitizen ==false){
      this.YesNoJMBG = false;
    }
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
    }

    this.foreignCitizenData.foreignCitizen = this.foreignCitizen

    sessionStorage.setItem('foreignCitizen', JSON.stringify(this.foreignCitizenData));
    // console.log(this.contractor.registrationNumber)

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
    sessionStorage.setItem('foreignCitizen', JSON.stringify(this.foreignCitizenData));

    this.onValueChangeRegistrationNumber(this.dateForeignBirthText)
  }



  onContractorInfoChange(info: ContractorInfo): void {
    // console.log("STA JE AAAAAAEEEEEEEEEEEEEEEE onContractorInfoChange", info);
  }

  onContractorSelect(event: any) {
    // console.log("UUUU POTREBNOJ COMP!!!!!!!!!!!!! Selected contractor:", event);
    // if (event && event.registrationNumber) {
    //   this.onValueChangeRegistrationNumber(event.registrationNumber);
    // }
    // if (event && event.firstName) {
    //   this.onValueChangeFirstName(event.firstName);
    // }
    // if (event && event.lastName) {
    //   this.onValueChangeLastName(event.lastName);
    // }
    // if (event && event.passportNumber) {
    //   this.onValueChangePassportNumber(event.passportNumber);
    // }
    // if (event && event.cityId) {
    //   const city = this.items_city.find(c => c.value === event.cityId);
    //   if (city) {
    //     this.onSelectedChangeCity(city);
    //   }
    // }
  }






}

