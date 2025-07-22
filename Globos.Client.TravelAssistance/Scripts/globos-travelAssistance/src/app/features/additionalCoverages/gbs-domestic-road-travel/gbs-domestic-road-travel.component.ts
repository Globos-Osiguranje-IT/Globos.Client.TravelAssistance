import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GbsInputComponent, GbsAutocompleteComponent, GbsDatePickerComponent } from 'ng-globos-core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoadAssistanceInsurance, DomesticInsurance, TripCancellation } from '../../../http/dto/requests/policy.model';
import { AdditionalCoverageTextEnum, Icons, InsuranceAdditionalCoverageEnum } from '../../../enums';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
import { TravelAgencies, TravelAgenciesComplete } from '../model/domestic-road-travel.model';
import { AllValidationsDirective } from '../../../validations/client-validation/allValidations';
import { Client } from '../../contractor-info/model/gbs-contractor-info.model';

@Component({
  selector: 'gbs-domestic-road-travel',
  standalone: true,
  imports: [CommonModule, FormsModule, GbsInputComponent, GbsAutocompleteComponent, AllValidationsDirective, GbsDatePickerComponent],
  templateUrl: './gbs-domestic-road-travel.component.html',
  styleUrl: './gbs-domestic-road-travel.component.scss'
})
export class GbsDomesticRoadTravelComponent {

  airplaneTakeoff: Icons = Icons.AirplaneTakeOff;
  airplaneLanding: Icons = Icons.AirplaneLanding;

  today: Date = new Date();
  maxDate: Date = new Date(2100, 0, 1);
  minDate: Date | null = new Date(1940, 0, 1);
  @Input() selectedStartDate: string = '';
  @Input() selectedEndDate: string = '';


  road: RoadAssistanceInsurance = {
    startDate: new Date(),
    endDate: new Date(),
    platesNumber: '',
    chassisNumber: '',
    vehicleBrand: '',
    vehicleType: ''
  };

  vehicleTypeItems: any[] = [
    { label: 'Putničko', value: 'Putničko' },
    { label: 'Dostavno', value: 'Dostavno' }
  ];

  domestic: DomesticInsurance = {
    address: ''
  };

  trip: TripCancellation = {
    travelAgencyId: 0,
    travelAgencyName: '',
    contractNumber: '',
    price: 0
  };

  travelAgencies: TravelAgencies[] = [];
  items_travelAgenciesComplete: TravelAgenciesComplete[] = [];

  additionalCoverage = InsuranceAdditionalCoverageEnum;
  additionalCoverageText = AdditionalCoverageTextEnum;
  disablePrice = true;

  selectedAgency: TravelAgenciesComplete = new TravelAgenciesComplete();
  infoOfferRequest: any;
  selectedAdditionalInsurances: any
  additionalCoverageListId!: number[];

  @Input() roadAssistanceInsurance: RoadAssistanceInsurance | any = null;
  @Input() domesticInsurance: DomesticInsurance | any = null;
  @Input() tripCancellation: TripCancellation | any = null;
  @Input() client?: Client;

  @Output() roadChange = new EventEmitter<RoadAssistanceInsurance>();
  // @Output() domesticChange = new EventEmitter<DomesticInsurance>();
  // @Output() tripChange = new EventEmitter<TripCancellation>();

  constructor(private cashedSessionService: CashedCodebookClientService) { }

  ngOnInit(): void {
    this.fillPolicyOffer();

    if (this.roadAssistanceInsurance)
      this.road = this.roadAssistanceInsurance;

    // if (this.domesticInsurance)
    //   this.domestic = this.domesticInsurance;

    // if(this.tripCancellation)
    //   this.trip = this.tripCancellation;

    // this.fillPolicyOffer()
  }

  private saveTripToSession(): void {
    sessionStorage.setItem('tripCancellation', JSON.stringify(this.tripCancellation));
  }

  // mapAgenciesToAutocomplete(agencies: TravelAgencies[]): TravelAgenciesComplete[] {
  //   return agencies.map((agency) => ({
  //     label: agency.name,
  //     value: agency.id.toString(),
  //     cid: agency.name || ''
  //   }));
  // }

  fillPolicyOffer() {

    const PolicyOfferJSON = localStorage.getItem('policyOffer');

    if (PolicyOfferJSON) {
      const policyOffer = JSON.parse(PolicyOfferJSON);

      console.log("usaoo ", policyOffer)
      // this.fillRoadAssistanceInsurance();
      if (policyOffer.startDate) {
        this.selectedStartDate = policyOffer.startDate;
      }

      if (policyOffer.endDate) {
        this.selectedEndDate = policyOffer.endDate;
      }
      this.road.platesNumber = policyOffer.platesNumber
      this.road.chassisNumber = policyOffer.chassisNumber
      this.road.vehicleBrand = policyOffer.vehicleBrand
      this.road.vehicleType = policyOffer.vehicleType

    }

    const SelectedAdditionalInsurancesJSON = sessionStorage.getItem('SelectedAdditionalInsurances');
    if (SelectedAdditionalInsurancesJSON) {
      this.selectedAdditionalInsurances = JSON.parse(SelectedAdditionalInsurancesJSON);

      // console.log("selectedAdditionalInsurances")
      // console.log(this.selectedAdditionalInsurances)
    }

    const infoOfferRequestJSON = sessionStorage.getItem('step1RequestObject');
    if (infoOfferRequestJSON) {
      this.infoOfferRequest = JSON.parse(infoOfferRequestJSON);
      this.trip.price = this.infoOfferRequest.arrangementPrice

      // console.log("infoOfferRequest")
      // console.log(this.infoOfferRequest)
    }


    // this.cashedSessionService.getTravelAgency().subscribe({
    //   next: (res) => {
    //     // console.log("agencije")
    //     // console.log(res)
    //     // this.items_travelAgenciesComplete = this.mapAgenciesToAutocomplete(res);

    //     const savedTrip = sessionStorage.getItem('tripCancellation');
    //     if (savedTrip) {
    //       this.tripCancellation = JSON.parse(savedTrip);

    //       const selectedId = this.tripCancellation.travelAgencyId.toString();
    //       const agency = this.items_travelAgenciesComplete.find(a => a.value === selectedId);
    //       if (agency) {
    //         this.selectedAgency = agency;
    //       }
    //     }
    //   },
    //   error: (error) => console.error("Erorr: ", error)
    // })
  }

  private saveToSession(): void {
    sessionStorage.setItem('roadAssistanceInsurance', JSON.stringify(this.roadAssistanceInsurance));
    // sessionStorage.setItem('domesticInsurance', JSON.stringify(this.domesticInsurance));
  }

  onValueChangePlatesNumber(value: string) {
    if (!this.roadAssistanceInsurance) {
      this.roadAssistanceInsurance = {};
    }
    this.roadAssistanceInsurance.platesNumber = value;
    // console.log(value)

    this.saveToSession();

    this.roadChange.emit(this.roadAssistanceInsurance);
  }

  onValueChangeChassisNumber(value: string) {
    if (!this.roadAssistanceInsurance) {
      this.roadAssistanceInsurance = {};
    }
    this.roadAssistanceInsurance.chassisNumber = value;

    this.saveToSession();

    this.roadChange.emit(this.roadAssistanceInsurance);
  }

  onValueChangeVehicleBrand(value: string) {
    if (!this.roadAssistanceInsurance) {
      this.roadAssistanceInsurance = {};
    }
    this.roadAssistanceInsurance.vehicleBrand = value;

    this.saveToSession();

    this.roadChange.emit(this.roadAssistanceInsurance);
  }

  onValueChangeVehicleType(value: string) {
    if (!this.roadAssistanceInsurance) {
      this.roadAssistanceInsurance = {};
    }
    this.roadAssistanceInsurance.vehicleType = value;

    this.saveToSession();

    this.roadChange.emit(this.roadAssistanceInsurance);
  }


  onValueChangeStartDate(value: string) {
    if (!this.roadAssistanceInsurance) {
      this.roadAssistanceInsurance = {};
    }

    const startDate = new Date(value);

    this.selectedStartDate = startDate.toISOString();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    this.selectedEndDate = endDate.toISOString();


    this.roadAssistanceInsurance.startDate = value;
    this.roadAssistanceInsurance.endDate = this.selectedEndDate;

    this.saveToSession();

    this.roadChange.emit(this.roadAssistanceInsurance);
  }

  // onValueChangeEndDate(value: string) {
  //   if (!this.roadAssistanceInsurance) {
  //     this.roadAssistanceInsurance = {};
  //   }
  //   this.roadAssistanceInsurance.endDate = value;

  //   this.saveToSession();

  //   this.roadChange.emit(this.roadAssistanceInsurance);
  // }



  // onValueChangeAddress(value: string) {
  //   if (!this.domesticInsurance) {
  //     this.domesticInsurance = {};
  //   }
  //   this.domesticInsurance.address = value;

  //   this.saveToSession();

  //   this.domesticChange.emit(this.domesticInsurance);
  // }

  // onValueChangeContractNumber(value: string) {
  //   if (!this.tripCancellation) {
  //     this.tripCancellation = {};
  //   }
  //   this.tripCancellation.contractNumber = value;
  //   this.saveTripToSession();

  //   this.saveToSession();

  //   this.tripChange.emit(this.tripCancellation);
  // }


  onValueChangePrice(value: string) {
    if (!this.tripCancellation) {
      this.tripCancellation = {};
    }
    this.tripCancellation.price = parseInt(value);
    this.saveTripToSession();
    this.tripCancellation.price = parseInt(value);
    // this.tripChange.emit(this.tripCancellation);
  }


  onSelectedChangeAgencies(event: TravelAgenciesComplete) {
    if (!this.tripCancellation) {
      this.tripCancellation = {};
    }
    // console.log("cena")
    // console.log(event)
    // console.log(event.value)
    this.selectedAgency = event;
    this.tripCancellation.travelAgencyId = Number(event.value);
    this.tripCancellation.travelAgencyName = event.label;
    this.tripCancellation.price = this.infoOfferRequest.arrangementPrice
    this.saveTripToSession();
    // this.tripChange.emit(this.tripCancellation);
  }


  // onStartDateChange(event: any) {

  //   this.selectedStartDate = event;



  // }

  // onStartDateChange(event: any) {
  //   const startDate = new Date(event);

  //   this.selectedStartDate = startDate.toISOString();
  //   const endDate = new Date(startDate);
  //   endDate.setFullYear(endDate.getFullYear() + 1);
  //   this.selectedEndDate = endDate.toISOString(); 
  // }




  toDate(dateStr: string | Date | null): Date | null {
    if (!dateStr) return null;

    if (dateStr instanceof Date) {
      return dateStr;
    }

    if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
        const isoDate = new Date(dateStr);
        return isNaN(isoDate.getTime()) ? null : isoDate;
      }

      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const localDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );
        return isNaN(localDate.getTime()) ? null : localDate;
      }

      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? null : fallback;
    }

    return null;
  }
}
