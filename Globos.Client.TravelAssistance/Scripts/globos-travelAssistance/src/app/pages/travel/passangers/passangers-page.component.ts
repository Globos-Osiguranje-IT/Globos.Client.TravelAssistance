import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ConsentFeatureComponent } from "../../../features/consent/consent-feature/consent-feature.component";
import { ContractorTypeFeatureComponent } from '../../../features/contractor-type/contractor-type-feature.component';
import { City, CodebookResponse } from '../../../http/dto/responses/codebook-response.model';
import { CityAutoComplete, Client, ContractorInfo, foreignCitizenData } from '../../../features/contractor-info/model/gbs-contractor-info.model';
import { InsurantInfo } from '../../../features/insurant-info/model/gbs-insurant-info-feature.model';
import { InsuredLegalInfo } from '../../../features/insured-legal-info/gbs-insured-legal-info-feature/model/Insured-legal-info-feature,model';
import { AdditionalCoverages, ConsentRequest, DomesticInsurance, PolicySaveRequest, RoadAssistanceInsurance, TripCancellation } from '../../../http/dto/requests/policy.model';
import { GbsButtonComponent } from "ng-globos-core";
import { Consent } from '../../../features/consent/consent-feature/model/consent-item.model';
import { PolicyClientService } from '../../../http/policy-client.service';
import { GbsDomesticRoadTravelComponent } from '../../../features/additionalCoverages/gbs-domestic-road-travel/gbs-domestic-road-travel.component';
import { CommonModule } from '@angular/common';
import { Destination } from '../../../features/destination/models/destination';
import { LoaderService } from '../../../services/loader.service';
import { Router } from '@angular/router';
import { JmbgValidationService } from '../../../validations/client-validation/jmbg-validation.service';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
import { DestinationComponent } from "../../../features/destination/destination.component";
import { ClientValidationService } from '../../../validations/client-validation/client-validation.service';

@Component({
  selector: 'app-passangers-page',
  standalone: true,
  imports: [CommonModule, ConsentFeatureComponent, ContractorTypeFeatureComponent, GbsButtonComponent,
    GbsDomesticRoadTravelComponent, DestinationComponent],
  templateUrl: './passangers-page.component.html',
  styleUrl: './passangers-page.component.scss'
})
export class PassangersPageComponent implements OnInit {
  errorMessage: string | null = null;

  @ViewChild(ConsentFeatureComponent) consentComponent!: ConsentFeatureComponent;

  foreignCitizen: any;
  infoOfferRequest: any;
  selectedOfferRequest: any;
  responseHomeInsurance: any;
  responseTrafficInsurance: any;

  codebookResponse!: CodebookResponse;
  contractorInfoChange!: ContractorInfo;
  insurantInfoChange!: InsurantInfo;
  insuredLegalInfoChange!: InsuredLegalInfo;
  consent!: Consent[];
  destination!: Destination;
  insurantInfoList: InsurantInfo[] = [];
  PolicySaveRequest!: PolicySaveRequest;
  additionalCoverageListId!: number[];

  isInsuredContractorShared: boolean = false;

  additionalCoveragesList: AdditionalCoverages[] = [];

  roadAssistanceInsurance: RoadAssistanceInsurance | any = null;
  domesticInsurance: DomesticInsurance | any = null;
  tripCancellation: TripCancellation | any = null;

  roadAssistanceInsuranceObj: AdditionalCoverages | any = null;
  domesticInsuranceObj: AdditionalCoverages | any = null;
  tripCancellationObj: AdditionalCoverages | any = null;

  contractors: CodebookResponse[] = [];
  passportError: boolean = false;

  @Input() contractorTypeId!: number;
  @Output() contractorSelected = new EventEmitter<CodebookResponse>();

  contractorType?: CodebookResponse;

  items_city: CityAutoComplete[] = [];
  selectedCity: CityAutoComplete = new CityAutoComplete();

  selectedConsents: number[] = [];

  client?: Client;
  selectedDestination: Destination | any = null;
  selectedDestinationId: number | null = null;

  platesNumber: string = '';
  chassisNumber: string = '';
  vehicleBrand: string = '';
  vehicleType: string = '';

  address: string = '';



  constructor(
    private policyClientService: PolicyClientService,
    private loader: LoaderService,
    private router: Router,
    private jmbgValidator: JmbgValidationService,
    private cashedSession: CashedCodebookClientService,
    private clientValidationService: ClientValidationService) { }

  ngOnInit(): void {

    // sessionStorage.removeItem('foreignCitizen')
    window.scrollTo(0, 0);
    // console.log(this.additionalCoverageListId)

    this.cashedSession.getContractorType().subscribe({
      next: (res) => {
        this.contractors = res;
      },
      error: (error) => console.error("Error: ", error)
    });

    this.cashedSession.getCity().subscribe({
      next: (res) => {
        this.items_city = this.mapCitiesToAutocomplete(res);
      },
      error: (error) => console.error("Erorr: ", error)
    })
  

    this.fillField();
    this.fillPolicyOffer();
    this.fillRestAdditionalInsurances();
    this.fillContractorTypeAndClient();
    this.fillConsentsAndDestination();
    this.fillAditionalCoverages();
  }

  mapCitiesToAutocomplete(cities: City[]): CityAutoComplete[] {
    return cities.map((city) => ({
      label: city.name,
      value: city.id.toString(),
      cid: city.zip || ''
    }));
  }

  handleInsuredContractorChange(value: boolean): void {
    this.isInsuredContractorShared = value;

    sessionStorage.removeItem('isInsuredContractorShared');
    sessionStorage.setItem("isInsuredContractorShared", JSON.stringify(this.isInsuredContractorShared));



    if (this.isInsuredContractorShared) {
      this.handleContractorAsInsurant();
    }
    if (this.isInsuredContractorShared == false) {
      this.removeFromList()
    }
  }

  onPassportErrorChanged(isError: boolean) {
    this.passportError = isError;
  }


  fillPolicyOffer() {
    const infoOfferRequestJSON = sessionStorage.getItem('step1RequestObject');
    const selectedOfferJSON = sessionStorage.getItem('selectedOffer'); //za 7 podaci
    const homeInsuranceJSON = sessionStorage.getItem('responseHomeInsurance');
    const trafficInsuranceJSON = sessionStorage.getItem('responseTrafficInsurance')


    if (infoOfferRequestJSON) {
      this.infoOfferRequest = JSON.parse(infoOfferRequestJSON);

      this.additionalCoverageListId = this.infoOfferRequest.additionalCoverageIDs;
      this.policyClientService.policySaveRequest.PolicyOffer.coverrageLevelId = this.infoOfferRequest.coverrageLevelId;
      this.policyClientService.policySaveRequest.PolicyOffer.endDate = this.infoOfferRequest.endDate;
      this.policyClientService.policySaveRequest.PolicyOffer.insuranceCategoryId = this.infoOfferRequest.insuranceCategoryId;
      this.policyClientService.policySaveRequest.PolicyOffer.policyDate = this.infoOfferRequest.insurancePurchaseDate;
      this.policyClientService.policySaveRequest.PolicyOffer.insuranceTypeId = this.infoOfferRequest.insuranceTypeId;
      this.policyClientService.policySaveRequest.PolicyOffer.insuranceTypePeriodPackageId = this.infoOfferRequest.insuranceTypePeriodPackageId;
      this.policyClientService.policySaveRequest.PolicyOffer.insurantsPerAgeGroups = this.infoOfferRequest.insurantsPerAgeGroups;
      this.policyClientService.policySaveRequest.PolicyOffer.isForStudents = this.infoOfferRequest.isForStudents;
      this.policyClientService.policySaveRequest.PolicyOffer.startDate = this.infoOfferRequest.startDate;
      // if(selectedOfferJSON){
      //   this.policyClientService.policySaveRequest.PolicyOffer
      // }
      // this.policyClientService.policySaveRequest.PolicyOffer.additionalCoverages = this.infoOfferRequest.additionalCoverageIDs;

    }
    if (selectedOfferJSON) {
      this.selectedOfferRequest = JSON.parse(selectedOfferJSON);
      // console.log("selectedOfferRequest PODACI", this.selectedOfferRequest)
      this.policyClientService.policySaveRequest.PolicyOffer.additionalInsuranceAmount = this.selectedOfferRequest.additionalInsuranceAmount;
      this.policyClientService.policySaveRequest.PolicyOffer.additionalInsuranceTax = this.selectedOfferRequest.additionalInsuranceTax;
      this.policyClientService.policySaveRequest.PolicyOffer.amount = this.selectedOfferRequest.amount;
      this.policyClientService.policySaveRequest.PolicyOffer.discount = this.selectedOfferRequest.discount;
      this.policyClientService.policySaveRequest.PolicyOffer.discountId = this.selectedOfferRequest.discountId;
      this.policyClientService.policySaveRequest.PolicyOffer.travelInsuranceDiscount = this.selectedOfferRequest.travelInsuranceDiscount;
      this.policyClientService.policySaveRequest.PolicyOffer.travelInsuranceFinalAmount = this.selectedOfferRequest.travelInsuranceFinalAmount;
      this.policyClientService.policySaveRequest.PolicyOffer.taxTravelInsuranceAfterDiscount = this.selectedOfferRequest.taxTravelInsuranceAfterDiscount;
      this.policyClientService.policySaveRequest.PolicyOffer.finalAmount = this.selectedOfferRequest.finalAmount;
      this.policyClientService.policySaveRequest.PolicyOffer.insuredSumId = this.selectedOfferRequest.insuranceSumId;
      this.policyClientService.policySaveRequest.PolicyOffer.tariffId = this.selectedOfferRequest.tariffId;
      this.policyClientService.policySaveRequest.PolicyOffer.tax = this.selectedOfferRequest.tax;
      this.policyClientService.policySaveRequest.PolicyOffer.territorialCoverageId = this.selectedOfferRequest.territorialCoverageId;
    }

    if (homeInsuranceJSON) {
      var homeinsurance = JSON.parse(homeInsuranceJSON)

      // this.policyClientService.policySaveRequest.PolicyOffer.amount += homeinsurance.amount;
      this.policyClientService.policySaveRequest.PolicyOffer.additionalInsuranceAmount += homeinsurance.amount
      this.policyClientService.policySaveRequest.PolicyOffer.additionalInsuranceTax += homeinsurance.taxAmount
      this.policyClientService.policySaveRequest.PolicyOffer.finalAmount += homeinsurance.finalAmount;
      // this.policyClientService.policySaveRequest.PolicyOffer.tax += homeinsurance.taxAmount;
    }

    if (trafficInsuranceJSON) {
      var trafficinsurance = JSON.parse(trafficInsuranceJSON)

      // this.policyClientService.policySaveRequest.PolicyOffer.amount += trafficinsurance.amount;
      this.policyClientService.policySaveRequest.PolicyOffer.additionalInsuranceAmount += trafficinsurance.amount
      this.policyClientService.policySaveRequest.PolicyOffer.additionalInsuranceTax += trafficinsurance.taxAmount
      this.policyClientService.policySaveRequest.PolicyOffer.finalAmount += trafficinsurance.finalAmount;
      // this.policyClientService.policySaveRequest.PolicyOffer.tax += trafficinsurance.taxAmount;
    }
  }

  fillField() {
    const infoOfferRequestJSON = sessionStorage.getItem('step1RequestObject');
    if (infoOfferRequestJSON) {
      // console.log("infoOfferRequestJSON PODACI", infoOfferRequestJSON)
      const infoOfferRequest = JSON.parse(infoOfferRequestJSON);
    }
  }

  fillTripCancellatio() {
    // console.log(this.selectedOfferRequest);

    if (!this.selectedOfferRequest) return;

    if (this.selectedOfferRequest?.additionalCoverages) {
      this.selectedOfferRequest.additionalCoverages.forEach((el: any) => {
        if (el.insuranceAdditionalCoverageId !== 7) {
          return;
        }
        const newTripCancellationObj: AdditionalCoverages = {
          additionalCoverageId: el.insuranceAdditionalCoverageId,
          amount: el.amount,
          tax: el.tax,
          finalAmount: el.finalAmount,
          discount: el.discount,
          taxAfterDiscount: el.taxAfterDiscount,
          finalAmountAfterDiscount: el.finalAmountAfterDiscount,
          currencyId: el.currencyId,
          tripCancellation: this.tripCancellation,
        };

        const index = this.additionalCoveragesList?.findIndex(
          (item) => item.tripCancellation !== undefined
        );

        if (index !== undefined && index !== -1) {
          this.additionalCoveragesList[index] = {
            ...this.additionalCoveragesList[index],
            ...newTripCancellationObj,
          };
          // console.log("UPDATED existing trip cancellation:", this.additionalCoveragesList[index]);
        } else {
          this.additionalCoveragesList?.push(newTripCancellationObj);
          // console.log("INSERTED new trip cancellation:", newTripCancellationObj);
        }

        // console.log("Updated additionalCoveragesList:", this.additionalCoveragesList)
      })
    }
  }

  fillDomesticInsurance() {
    const responseHomeInsuranceJSON = sessionStorage.getItem('responseHomeInsurance');
    if (!responseHomeInsuranceJSON) return;

    this.responseHomeInsurance = JSON.parse(responseHomeInsuranceJSON);

    const newDomesticInsuranceObj: AdditionalCoverages = {
      additionalCoverageId: this.responseHomeInsurance.insuranceAdditionalCoverageId,
      amount: this.responseHomeInsurance.amount,
      tax: this.responseHomeInsurance.taxAmount,
      finalAmount: this.responseHomeInsurance.finalAmount,
      discount: 0,//this.responseHomeInsurance.discount,
      taxAfterDiscount: 0,//this.responseHomeInsurance.taxAfterDiscount,
      finalAmountAfterDiscount: 0,//this.responseHomeInsurance.finalAmountAfterDiscount,
      currencyId: this.responseHomeInsurance.currencyId,
      domesticInsurance: this.domesticInsurance,
    };

    const index = this.additionalCoveragesList?.findIndex(
      (item) => item.domesticInsurance !== undefined
    );

    if (index !== undefined && index !== -1) {
      this.additionalCoveragesList[index] = {
        ...this.additionalCoveragesList[index],
        ...newDomesticInsuranceObj,
      };
      // console.log("UPDATED domesticInsurance:", this.additionalCoveragesList[index]);
    } else {
      this.additionalCoveragesList?.push(newDomesticInsuranceObj);
      // console.log("INSERTED new domesticInsurance:", newDomesticInsuranceObj);
    }
  }

  fillRoadAssistanceInsurance() {
    const responseTrafficInsuranceJSON = sessionStorage.getItem('responseTrafficInsurance');
    if (!responseTrafficInsuranceJSON) return;

    this.responseTrafficInsurance = JSON.parse(responseTrafficInsuranceJSON);

    const newRoadAssistanceInsuranceObj: AdditionalCoverages = {
      additionalCoverageId: this.responseTrafficInsurance.insuranceAdditionalCoverageId,
      amount: this.responseTrafficInsurance.amount,
      tax: this.responseTrafficInsurance.taxAmount,
      finalAmount: this.responseTrafficInsurance.finalAmount,
      discount: 0,//this.responseTrafficInsurance.discount,
      taxAfterDiscount: 0,//this.responseTrafficInsurance.taxAfterDiscount,
      finalAmountAfterDiscount: 0,//this.responseTrafficInsurance.finalAmountAfterDiscount,
      currencyId: this.responseTrafficInsurance.currencyId,
      roadAssistanceInsurance: this.roadAssistanceInsurance,
    };

    const index = this.additionalCoveragesList?.findIndex(
      (item) => item.roadAssistanceInsurance !== undefined
    );

    if (index !== undefined && index !== -1) {
      this.additionalCoveragesList[index] = {
        ...this.additionalCoveragesList[index],
        ...newRoadAssistanceInsuranceObj,
      };
      // console.log("UPDATED roadAssistanceInsurance:", this.additionalCoveragesList[index]);
    } else {
      this.additionalCoveragesList?.push(newRoadAssistanceInsuranceObj);
      // console.log("INSERTED new roadAssistanceInsurance:", newRoadAssistanceInsuranceObj);
    }
  }

  fillRestAdditionalInsurances() {
    const selectedOfferJSON = sessionStorage.getItem('selectedOffer');

    if (!selectedOfferJSON) return;

    this.fillTripCancellatio();
    this.fillDomesticInsurance();
    this.fillRoadAssistanceInsurance();

    const selectedOffer = JSON.parse(selectedOfferJSON);

    if (selectedOffer?.additionalCoverages) {
      selectedOffer.additionalCoverages.forEach((el: any) => {
        if (el.insuranceAdditionalCoverageId === 7) {
          return;
        }

        const newCoverage: AdditionalCoverages = {
          additionalCoverageId: el.insuranceAdditionalCoverageId,
          amount: el.amount,
          tax: el.tax,
          finalAmount: el.finalAmount,
          discount: el.discount,
          taxAfterDiscount: el.taxAfterDiscount,
          finalAmountAfterDiscount: el.finalAmountAfterDiscount,
          currencyId: el.currencyId
        };

        const existingIndex = this.additionalCoveragesList.findIndex(
          (item) => item.additionalCoverageId === newCoverage.additionalCoverageId
        );

        if (existingIndex === -1) {
          this.additionalCoveragesList.push(newCoverage);
        }
      });
    }


  }




  // let nizDodatnihPokrica = selectedOfferJSON ? JSON.parse(selectedOfferJSON) : null;
  // let additionalCoveragesTemp: AdditionalCoverages | undefined = undefined;

  // if (nizDodatnihPokrica != null) {
  //   nizDodatnihPokrica.additionalCoverages.forEach((el: any) => {
  //     if (!additionalCoveragesTemp) {
  //       additionalCoveragesTemp = {} as AdditionalCoverages;
  //     }
  //     additionalCoveragesTemp.additionalCoverageId = el.insuranceAdditionalCoverageId;
  //     additionalCoveragesTemp.amount = el.amount;
  //     additionalCoveragesTemp.tax = el.tax;
  //     additionalCoveragesTemp.finalAmount = el.finalAmount;
  //     additionalCoveragesTemp.currencyId = el.currencyId;
  //     additionalCoveragesTemp.roadAssistanceInsurance = {} as RoadAssistanceInsurance;

  //     const index = this.additionalCoveragesList?.findIndex(
  //       (item) => item.roadAssistanceInsurance !== undefined
  //     );

  //     if (index !== undefined && index !== -1) {
  //       this.additionalCoveragesList[index] = {
  //         ...this.additionalCoveragesList[index],
  //         ...additionalCoveragesTemp
  //       }
  //     }
  //     this.additionalCoveragesList?.push(additionalCoveragesTemp)
  //   });
  // }






  fillContractorTypeAndClient() {
    const policySaveRequestSession = sessionStorage.getItem('policySaveRequest');
    const contractorTypesSession = sessionStorage.getItem('contratorType');
    const contractorInfoChangeSession = sessionStorage.getItem('contractorInfoChange');
    const selectedCitySession = sessionStorage.getItem('selectedCity');
    const isInsuredContractorSharedSession = sessionStorage.getItem('isInsuredContractorShared');


    if (policySaveRequestSession) {
      // console.log("JEL TI POPUNJEN CODEBOOK RESPONSE: ", this.codebookResponse)
      const policySaveRequestHelper: any = JSON.parse(policySaveRequestSession);
      const contractrorTypeHelper: CodebookResponse[] = contractorTypesSession ? JSON.parse(contractorTypesSession) : null;
      const contractorInfoChangeHelper: ContractorInfo = contractorInfoChangeSession ? JSON.parse(contractorInfoChangeSession) : null;
      const selectedCitySessionHelper: CityAutoComplete = selectedCitySession ? JSON.parse(selectedCitySession) : null;
      const isInsuredContractorSharedSessionHelper: boolean = isInsuredContractorSharedSession ? JSON.parse(isInsuredContractorSharedSession) : false;


      this.contractorTypeId = policySaveRequestHelper.Client ? policySaveRequestHelper.Client.clientTypeId : 0;
      this.contractorType = contractrorTypeHelper.find(ct => ct.id === this.contractorTypeId);
      this.client = policySaveRequestHelper.Client ? policySaveRequestHelper.Client : null;
      this.contractorInfoChange = contractorInfoChangeHelper || null;
      this.selectedCity = selectedCitySessionHelper;
      this.isInsuredContractorShared = isInsuredContractorSharedSessionHelper;

      this.codebookResponse = this.contractorType as any;
    }
    else {
      this.contractorType = { id: 1, name: 'Fizičko lice' }
      this.codebookResponse = { id: 1, name: 'Fizičko lice' }
    }
  }

  //cuva i popunjava iz sesije destinaciju i consents (checkboxove)
  fillConsentsAndDestination() {
    const policySaveRequestSession = sessionStorage.getItem('policySaveRequest');

    if (policySaveRequestSession) {
      const consentSessionHelper: Consent[] = policySaveRequestSession ? JSON.parse(policySaveRequestSession).Consents : null;

      consentSessionHelper.forEach(el => el.checked = true);

      consentSessionHelper.forEach((element: any) => {
        this.selectedConsents.push(Number(element.consentId));
      });
      this.consent = consentSessionHelper;

      // this.destination = this.selectedDestination
    }
  }

  //cuva i popunjava iz sesije podatke o road i domestic insurance (kada su na prvoj strani cekirana 2 togla iz futera)
  fillAditionalCoverages() {
    const policySaveRequestSession = sessionStorage.getItem('policySaveRequest');
    const roadAssistanceInsuranceSession = sessionStorage.getItem('roadAssistanceInsurance');
    const domesticInsuranceSession = sessionStorage.getItem('domesticInsurance');
    const tripCancellationSession = sessionStorage.getItem('tripCancellation');

    // console.log(roadAssistanceInsuranceSession)
    // console.log(domesticInsuranceSession)
    // console.log(tripCancellationSession)

    if (policySaveRequestSession) {
      const roadAssistanceInsuranceHelper: RoadAssistanceInsurance = roadAssistanceInsuranceSession ? JSON.parse(roadAssistanceInsuranceSession) : null;
      const domesticInsuranceHelper: DomesticInsurance = domesticInsuranceSession ? JSON.parse(domesticInsuranceSession) : null;
      const tripCancellationHelper: TripCancellation = tripCancellationSession ? JSON.parse(tripCancellationSession) : null;

      if (roadAssistanceInsuranceHelper) {
        this.platesNumber = roadAssistanceInsuranceHelper.platesNumber;
        this.chassisNumber = roadAssistanceInsuranceHelper.chassisNumber;
        this.vehicleBrand = roadAssistanceInsuranceHelper.vehicleBrand;
        this.vehicleType = roadAssistanceInsuranceHelper.vehicleType

        this.roadAssistanceInsurance = roadAssistanceInsuranceHelper;
        this.fillRoadAssistanceInsurance();
      }

      if (domesticInsuranceHelper) {
        this.address = domesticInsuranceHelper.address;
        this.domesticInsurance = domesticInsuranceHelper;
        this.fillDomesticInsurance();
      }

      if (tripCancellationHelper) {
        this.tripCancellation = tripCancellationHelper;
        this.fillTripCancellatio();
      }
    }

    this.assemblePolicyRequest();
  }

  onContractorSelected(event: CodebookResponse) {
    this.codebookResponse = event;
    this.assemblePolicyRequest();
  }

  handleContractorInfo(info: ContractorInfo): void {
    this.contractorInfoChange = info;

    this.addRemoveFromList();
    this.assemblePolicyRequest();
  }

  handleInsurantInfo(infoList: InsurantInfo[]): void {
    this.insurantInfoList = infoList;

    this.addRemoveFromList();
    this.assemblePolicyRequest();
  }

  handleInsuredLegalInfo(info: InsuredLegalInfo): void {
    this.insuredLegalInfoChange = info;
    this.assemblePolicyRequest();
  }

  handleConsent(info: Consent[]): void {
    this.consent = info;
    this.assemblePolicyRequest();
  }

  handleDestination(info: Destination): void {
    // console.log("Destination passanger", info)
    this.destination = info;

    this.policyClientService.policySaveRequest.PolicyOffer.destinationId = Number(this.destination.value);
    this.assemblePolicyRequest();
  }

  handleRoadChange(road: RoadAssistanceInsurance): void {
    this.roadAssistanceInsurance = road;
    this.fillRoadAssistanceInsurance();
    this.assemblePolicyRequest();
  }

  handleDomesticChange(domestic: DomesticInsurance): void {
    this.domesticInsurance = domestic;
    this.fillDomesticInsurance();
    this.assemblePolicyRequest();
  }

  handleTripChange(trip: TripCancellation): void {
    this.tripCancellation = trip;
    this.fillTripCancellatio()
    this.assemblePolicyRequest();
  }

  removeFromList() {

    if (this.contractorInfoChange) {
      if (this.contractorInfoChange.registrationNumber) {
        this.insurantInfoList = this.insurantInfoList?.filter(
          insurant => insurant?.registrationNumber != this.contractorInfoChange.registrationNumber
        );
      }
    }
    this.assemblePolicyRequest();
  }

  addRemoveFromList() {
    if (this.isInsuredContractorShared) {
      this.handleContractorAsInsurant();
    }
    if (this.isInsuredContractorShared == false) {
      this.removeFromList()
    }
  }

  private assemblePolicyRequest(): void {
    this.policyClientService.policySaveRequest.PolicyOffer.additionalCoverages = this.additionalCoveragesList
    if (this.contractorInfoChange) {
      sessionStorage.setItem('contractorInfoChange', JSON.stringify(this.contractorInfoChange));

      this.policyClientService.policySaveRequest.PolicyOffer.issuancePlace = 'WEB';//uvek treba da bude WEB

      const policyIdSession = sessionStorage.getItem('policyId');
      // console.log("policyIdSession", policyIdSession)
      if (policyIdSession) {
        this.policyClientService.policySaveRequest.PolicyOffer.id = Number(policyIdSession);
      }

      //Ako postoji agentCode u SessionStorage, prepisati ga u saveRequest objekat
      const agentCode = sessionStorage.getItem('AgentCode');
      if (agentCode != null) {
        this.policyClientService.policySaveRequest.PolicyOffer.agentCode = agentCode;
      }

      this.PolicySaveRequest = {
        PolicyOffer: this.policyClientService.policySaveRequest.PolicyOffer,
        Client: this.mapContractorInfoToClient(this.contractorInfoChange),
        Insurants: this.insurantInfoList
          .filter(insurant => insurant !== null && insurant !== undefined)
          .map(insurant => this.mapInsurantInfoToClient(insurant)),

        Consents: this.consent?.map(consentItem => this.mapConsent(consentItem)) ?? []
      };
      sessionStorage.setItem('policySaveRequest', JSON.stringify(this.PolicySaveRequest));
    }
    // console.log("PolicySaveRequest sastavljen:", this.PolicySaveRequest);
  }

  private mapContractorInfoToClient(contractor: ContractorInfo): Client {
    return {
      clientTypeId: this.codebookResponse.id,
      firstName: contractor.firstName || '',
      lastName: contractor.lastName || '',
      registrationNumber: contractor.registrationNumber || '',
      companyName: contractor.companyName,
      taxIdentificationNumber: contractor.taxIdentificationNumber || '',
      birthDate: contractor.dateBirth ? this.parseCustomDate(contractor.dateBirth) : undefined,
      passportNumber: contractor.passportNumber || '',
      residency: 'Srpsko',
      address: contractor.street && contractor.houseNumber && contractor.cityId ? {
        street: contractor.street,
        houseNumber: contractor.houseNumber,
        cityId: parseInt(contractor.cityId)
      } : undefined,
      phone: contractor.mobileNumber ? {
        phoneNumber: contractor.mobileNumber
      } : undefined,
      email: contractor.email ? {
        email: contractor.email
      } : undefined
    };
  }

  parseCustomDate(dateString: string): Date {
    const [day, month, year] = dateString.split('.');
    return new Date(`${year}-${month}-${day}`);
  }


  private mapInsurantInfoToClient(insurant: InsurantInfo): Client {
    return {
      clientTypeId: this.codebookResponse.id,
      firstName: insurant.firstName || '',
      lastName: insurant.lastName || '',
      registrationNumber: insurant.registrationNumber || '',
      passportNumber: insurant.passportNumber || '',
      residency: 'Srpsko',
      birthDate: insurant.birthDate ? this.parseCustomDate(insurant.birthDate) : undefined,
    };
  }

  private mapConsent(consent: Consent): ConsentRequest {
    return {
      consentId: Number(consent.id)
    };
  }

  foreignCitizenSession() {

    const foreignCitizenSession = sessionStorage.getItem('foreignCitizen');
    this.foreignCitizen = foreignCitizenSession ? JSON.parse(foreignCitizenSession) : null;
  }



  goToNextStep() {
    const isValid = this.validateAllLatinInputs();
    const isConsentValid = this.consentComponent?.isConsentValid?.() ?? true;
    this.passportError = !this.clientValidationService.passportNumbersAreUnique(this.insurantInfoList);

    this.foreignCitizenSession()


    if (!isConsentValid) {
      this.consentComponent.forceShowAlert = true;
    }


    if (!isValid || !isConsentValid || this.passportError) {
      // console.warn('Forma nije validna – neka obavezna polja nisu popunjena ili checkboxovi nisu čekirani.');
      return;
    }

    this.assemblePolicyRequest();
    this.loader.show();

    this.policyClientService.savePolicy().subscribe(result => {
      if (result.isSuccess) {
        sessionStorage.setItem('policySaveResponse', JSON.stringify(result.response));
        this.router.navigate(['putno-osiguranje', 'payment'])
        this.loader.hide();
      }
      else {

        this.errorMessage = 'Došlo je do greške prilikom čuvanja polise, molimo pokušajte ponovo.'

        if (result.Errors[0]?.includes("i broj osiguranika u starosnoj grupi")) {
          this.errorMessage += '\nUnete vrednosti za JMBG osiguranika se ne poklapaju sa izabranim starosnim grupama putnika.'
        }
        this.loader.hide();
      }
    })
  }

  handleContractorAsInsurant(): void {
    
    // console.log("handleContractorAsInsurant 1")
    if (!this.contractorInfoChange?.registrationNumber) return;

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
      const error = this.jmbgValidator.getJmbgValidationErrorForeign(this.contractorInfoChange.registrationNumber);
      if (error) {
        console.warn("JMBG nije validan:", error);
        return;
      }

    } if(foreignCitizen.foreignCitizen==false && foreignCitizen.foreignRNYesNo==false) {
      const error = this.jmbgValidator.getJmbgValidationError(this.contractorInfoChange.registrationNumber);
      if (error) {
        console.warn("JMBG nije validan:", error);
        return;
      }

    }

    const contractorAsInsurant: InsurantInfo = {
      registrationNumber: this.contractorInfoChange.registrationNumber,
      firstName: this.contractorInfoChange.firstName || '',
      lastName: this.contractorInfoChange.lastName || '',
      passportNumber: this.contractorInfoChange.passportNumber || '',
      birthDate: this.contractorInfoChange.dateBirth || '',
    };

    //Nađi insuranta koji ima isti JMBG kao prethodni ugovarač

    const oldIndex = this.insurantInfoList.findIndex(
      x => x?.registrationNumber === this.insurantInfoChange?.registrationNumber
    );

    // if (!this.insurantInfoChange?.registrationNumber) return;

    // const oldIndex = this.insurantInfoList?.findIndex(
    //   x => x?.registrationNumber === this.insurantInfoChange.registrationNumber
    // );



    if (oldIndex !== -1) {
      this.insurantInfoList[oldIndex] = contractorAsInsurant;
      this.passportError = !this.clientValidationService.passportNumbersAreUnique(this.insurantInfoList);
      // console.log("handleContractorAsInsurant 3", this.passportError)
      // console.log("handleContractorAsInsurant 3 this.insurantInfoList", this.insurantInfoList)
      // console.log("handleContractorAsInsurant 3")
    } else {
      const newIndex = this.insurantInfoList?.findIndex(
        x => x.registrationNumber === contractorAsInsurant.registrationNumber
      );

      if (newIndex !== -1) {
        this.insurantInfoList[newIndex] = contractorAsInsurant;
        // console.log("handleContractorAsInsurant 4")
      } else {
        this.insurantInfoList.push(contractorAsInsurant);
        // console.log("handleContractorAsInsurant 5")
      }
    }

    this.insurantInfoChange = contractorAsInsurant;
    this.assemblePolicyRequest();
  }



  // validateAllLatinInputs(): boolean {
  //   const invalidElements: HTMLElement[] = [];
  //   const elements = document.querySelectorAll('[appLatinOnFocusOut]');

  //   elements.forEach((element: any) => {
  //     const event = new FocusEvent('focusout');
  //     element.dispatchEvent(event);

  //     const parent = element.parentElement;
  //     const errorDiv = parent?.querySelector('.text-danger');

  //     if (errorDiv && errorDiv.textContent?.trim()) {
  //       invalidElements.push(element);
  //     }
  //   });

  //   if (invalidElements.length > 0) {
  //     const firstInvalid = invalidElements[0] as HTMLElement;
  //     firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     return false;
  //   }

  //   return true;
  // }

  validateAllLatinInputs(): boolean {
    const invalidElements: HTMLElement[] = [];
    const elements = document.querySelectorAll('[appLatinOnFocusOut]');

    elements.forEach((element: any) => {
      const event = new FocusEvent('focusout');
      element.dispatchEvent(event);

      const parent = element.parentElement;
      const errorDiv = parent?.querySelector('.text-danger');

      if (errorDiv && errorDiv.textContent?.trim()) {
        invalidElements.push(element);
      }
    });

    if (invalidElements.length > 0) {
      const firstInvalid = invalidElements[0] as HTMLElement;
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    return true;
  }

  goToPreviousStep() {
    this.router.navigate(['putno-osiguranje', 'info'])
  }


}
