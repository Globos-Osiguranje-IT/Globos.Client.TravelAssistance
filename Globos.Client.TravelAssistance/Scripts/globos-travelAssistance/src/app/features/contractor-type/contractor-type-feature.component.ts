import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslatePipe } from 'ng-globos-core';
import { CodebookResponse } from '../../http/dto/responses/codebook-response.model';
import { CodebookClientService } from '../../http/codebook-client.service';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { GbsContractorInfoFeatureComponent } from '../contractor-info/gbs-contractor-info-feature.component';
import { GbsInsurantInfoFeatureComponent } from '../insurant-info/gbs-insurant-info-feature.component';
import { GbsInsuredLegalInfoFeatureComponent } from "../insured-legal-info/gbs-insured-legal-info-feature/gbs-insured-legal-info-feature.component";
import { CityAutoComplete, Client, ContractorInfo, foreignCitizenData } from '../contractor-info/model/gbs-contractor-info.model';
import { InsuredLegalInfo } from '../insured-legal-info/gbs-insured-legal-info-feature/model/Insured-legal-info-feature,model';
import { ClientType, InsuredAgeGroupMap } from '../../enums';
import { InsurantInfo } from '../insurant-info/model/gbs-insurant-info-feature.model';
import { JmbgValidationService } from '../../validations/client-validation/jmbg-validation.service';
import { ClientValidationService } from '../../validations/client-validation/client-validation.service';

@Component({
  selector: 'gbs-contractor-type-feature',
  standalone: true,
  imports: [CommonModule, TranslatePipe, GbsContractorInfoFeatureComponent, GbsInsurantInfoFeatureComponent, GbsInsuredLegalInfoFeatureComponent],
  templateUrl: './contractor-type-feature.component.html',
  styleUrl: './contractor-type-feature.component.scss'
})
export class ContractorTypeFeatureComponent implements OnInit {
  [x: string]: any;
  insurantObj!: InsurantInfo;
  insuredAgeGroupMap = InsuredAgeGroupMap;
  insurantList: InsurantInfo[] = [];
  agesList = 0;

  infoOfferRequest: any;

  passportDuplicateError: boolean = false;

  foreignCitizenList: foreignCitizenData[] = [];
  

  enumContratorFizickoLice = ClientType.FIZICKO_LICE //1;
  enumContratorPravnoLice = ClientType.PRAVNO_LICE; //2

  @Input() contractorTypeId!: number;
  @Input() contractors: CodebookResponse[] = []
  @Input() contractorType?: CodebookResponse;
  @Input() client?: Client;
  @Input() items_city: CityAutoComplete[] = [];
  @Input() contractor: ContractorInfo | any = null;
  @Input() selectedCity: CityAutoComplete = new CityAutoComplete();
  @Input() isInsuredContractorShared: boolean = false;
  @Input() foreignCitizen: boolean = false;



  @Output() contractorSelected = new EventEmitter<CodebookResponse>();
  @Output() contractorInfoChange = new EventEmitter<ContractorInfo>();
  @Output() insurantInfoChange = new EventEmitter<InsurantInfo[]>();
  @Output() insuredLegalInfoChange = new EventEmitter<InsuredLegalInfo>();
  @Output() insuredContractorSharedChange = new EventEmitter<boolean>();
  @Output() passportErrorChange = new EventEmitter<boolean>();



  constructor(private codeBookService: CodebookClientService,
    private cashedSession: CashedCodebookClientService,
    private jmbgValidator: JmbgValidationService,
    private clientValidationService: ClientValidationService) { }

  ngOnInit(): void {
    // console.log("======================++++++++++++++++++++++PODACI IZ SESIJE POSLATI SA PASSENGER PAGE++++++++++++++++++++++======================")
    // console.log("CONTRARCTOR TYPE ID: ", this.contractorTypeId)
    // console.log("CONTRACTOR TYPE: ", this.contractorType)
    // console.log("CONTRACTORS: ", this.contractors)
    // console.log("CLIENT: ", this.client)
    // console.log("CONTRATOR: ", this.contractor)
    // console.log("CITY ITEMS: ", this.items_city)
    // console.log("----------------------------------------------------------------------------------------------------------------------------------")



    if (this.contractorType?.id == ClientType.PRAVNO_LICE) {
      this.isInsuredContractorShared = false;
    }


    // ✅ Učitaj prethodno sačuvane podatke o stranim državljanima
    const stored = sessionStorage.getItem('foreignCitizenList');
    if (stored) {
      this.foreignCitizenList = JSON.parse(stored);
    }


    this.fillField();
  }


  addList() {
    this.agesList = this.infoOfferRequest.insurantsPerAgeGroups.reduce((sum: any, item: any) => sum + (item.number || 0), 0);
    this.sum(this.isInsuredContractorShared);
  }

  fillField() {
    const infoOfferRequestJSON = sessionStorage.getItem('step1RequestObject');
    if (infoOfferRequestJSON) {
      this.infoOfferRequest = JSON.parse(infoOfferRequestJSON);
      this.agesList = this.infoOfferRequest.insurantsPerAgeGroups.reduce((sum: any, item: any) => sum + (item.number || 0), 0);
    }
  }

  sum(isInsuredContractorShared: boolean) {

    // console.log("SUMMMMM isInsuredContractorShared", isInsuredContractorShared)
    // console.log("SUMMMMM contractorType", this.contractorType?.id)

    if (isInsuredContractorShared && this.contractorType?.id == 1) {
      this.agesList = this.agesList - 1;
      this.removeLastIrrelevantInsurant()
    }
    if (isInsuredContractorShared == false && this.contractorType?.id == 1) {
      this.agesList = this.agesList;
    }

    if (isInsuredContractorShared == false && this.contractorType?.id == 2) {
      this.agesList = this.agesList;
      // console.log("USAO")
    }

  }

  onInsuredContractorChanged(value: boolean): void {
    this.isInsuredContractorShared = value;
    this.addList()
    this.insuredContractorSharedChange.emit(this.isInsuredContractorShared);
    // console.log("Dobio je vrednost ", this.isInsuredContractorShared)

    if (!value && this.insurantObj) {
      const contractorRegistration = this.insurantObj?.registrationNumber;
      if (contractorRegistration) {
        this.syncInsurantListWithContractor({ registrationNumber: contractorRegistration, firstName: '', lastName: '', passportNumber: '', birthDate: '' });
      }
    }
  }

  onForeignCitizenChange(event: { index: number, data: foreignCitizenData }) {
    const { index, data } = event;

    if (this.foreignCitizenList.length <= index) {
      this.foreignCitizenList.length = index + 1;
    }
    this.foreignCitizenList[index] = data;

    sessionStorage.setItem('foreignCitizenList', JSON.stringify(this.foreignCitizenList));

    // console.log("foreignCitizenList:", this.foreignCitizenList);
  }


  // passportNumbersAreUnique(): boolean {
  //   const counts = new Map<string, number>();

  //   for (const insurant of this.insurantList) {
  //     const passport = (insurant.passportNumber || '').trim();
  //     if (passport === '') continue; // prazni pasoši se ignorišu

  //     counts.set(passport, (counts.get(passport) || 0) + 1);
  //     if (counts.get(passport)! > 1) {
  //       return false; // nađen duplikat
  //     }
  //   }

  //   return true;
  // }


  insurantInfoChangeEmit() {
    this.passportDuplicateError = !this.clientValidationService.passportNumbersAreUnique(this.insurantList);
    // console.log("passportDuplicateError", this.passportDuplicateError)

    this.passportErrorChange.emit(this.passportDuplicateError);
    this.insurantInfoChange.emit(this.insurantList);
  }

  onMappedInsurantInfoFromContractor(mapped: InsurantInfo) {
    this.syncInsurantListWithContractor(mapped);
    this.insurantInfoChangeEmit();
  }

  removeLastIrrelevantInsurant(): void {
    this.insurantList = [];
    this.insurantInfoChangeEmit();
  }

  setContractorType(contractor: CodebookResponse): void {
    this.contractorType = contractor;
    // console.log("CONTRACTOR", this.contractor)

    if (this.contractorType?.id == ClientType.PRAVNO_LICE) {
      this.isInsuredContractorShared = false;
      this.insuredContractorSharedChange.emit(this.isInsuredContractorShared);
    }
    this.addList()
    // console.log("click", this.contractorType)

    if (this.contractor != undefined) {
      if (this.contractorType?.id == ClientType.PRAVNO_LICE) {
        if (this.contractor.registrationNumber != '' && this.contractor.registrationNumber.length == 13) {
          this.contractor.registrationNumber = '';
          this.contractor.dateBirth = '';
        }
        this.contractor.firstName == '' ? this.contractor.firstName = this.contractor.firstName : this.contractor.firstName = '';
        this.contractor.lastName == '' ? this.contractor.lastName = this.contractor.lastName : this.contractor.lastName = '';
      }
      else if (this.contractorType?.id == ClientType.FIZICKO_LICE) {
        if (this.contractor.registrationNumber != '' && this.contractor.registrationNumber.length < 13) {
          this.contractor.registrationNumber = '';
        }
        this.contractor.companyName == '' ? this.contractor.companyName = this.contractor.companyName : this.contractor.companyName = '';
        this.contractor.taxIdentificationNumber == '' ? this.contractor.taxIdentificationNumber = this.contractor.taxIdentificationNumber : this.contractor.taxIdentificationNumber = '';
        this.contractor.passportNumber == '' ? this.contractor.passportNumber = this.contractor.passportNumber : this.contractor.passportNumber = '';
      }
    }

    this.contractorSelected.emit(this.contractorType)
  }

  onContractorInfoChange(info: ContractorInfo): void {
    this.contractorInfoChange.emit(info);
  }

  onInsuredLegalInfoChange(info: InsuredLegalInfo): void {
    this.insuredLegalInfoChange.emit(info);
  }

  createArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  getCumulativeCount(groupIndex: number): number {
    let count = 0;
    for (let i = 0; i < groupIndex; i++) {
      count += this.agesList;
    }
    return count;
  }

  onInsurantInfoChange(info: InsurantInfo, index: number): void {

    if (this.insurantList.length <= index) {
      this.insurantList.length = index + 1;
    }
    this.insurantList[index] = info;

    this.insurantInfoChangeEmit();
  }

  syncInsurantListWithContractor(mapped: InsurantInfo): void {
    if (!this.isInsuredContractorShared) {
      this.insurantList = this.insurantList?.filter(i => i && i.registrationNumber !== this.insurantObj?.registrationNumber);
      this.insurantInfoChangeEmit();
      return;
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


    if (foreignCitizen.foreignCitizen && !foreignCitizen.foreignRNYesNo) {

      const jmbgError = this.jmbgValidator.getJmbgValidationErrorForeign(mapped.registrationNumber || '');
      if (jmbgError) {
        return;
      }
    }   if (foreignCitizen.foreignCitizen==false && foreignCitizen.foreignRNYesNo==false ) {
      const jmbgError = this.jmbgValidator.getJmbgValidationError(mapped.registrationNumber || '');
      if (jmbgError) {
        return;
      }
    }

    const existingIndex = this.insurantList.findIndex(
      i => i && i.registrationNumber === this.insurantObj?.registrationNumber
    );

    if (existingIndex !== -1) {
      this.insurantList[existingIndex] = mapped;
    } else {
      const byNewJmbg = this.insurantList.findIndex(i => i && i.registrationNumber === mapped.registrationNumber);
      if (byNewJmbg !== -1) {
        this.insurantList[byNewJmbg] = mapped;
      } else {
        this.insurantList.unshift(mapped);
      }
    }

    // console.log("USAOOO")
    // console.log(this.insurantList)
    this.insurantObj = mapped;
    this.insurantInfoChangeEmit();
  }


  get allJmbgs() {
    if (this.insurantList.length > 0) {
      return this.insurantList
        .filter(i => i && i.registrationNumber)
        .map(i => i.registrationNumber);
    }
    return [];
  }

  onContractorSelect(event: any): void {
    // this.contractorSelected.emit(event);
    // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASSSSSSSSSSSSSSSSSSS Selected contractor:", event);
  }
}


