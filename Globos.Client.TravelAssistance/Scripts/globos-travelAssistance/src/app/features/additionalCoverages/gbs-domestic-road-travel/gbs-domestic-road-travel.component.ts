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
  imports: [CommonModule, FormsModule, GbsInputComponent, GbsAutocompleteComponent, AllValidationsDirective, GbsDatePickerComponent
  ],
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
    vehicleType: '',
    yearOfProduction: ''
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
    price: 0,
    yearOfProduction: ''
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

    

    // if (this.domesticInsurance)
    //   this.domestic = this.domesticInsurance;

    // if(this.tripCancellation)
    //   this.trip = this.tripCancellation;

    // this.fillPolicyOffer()
  }

  private saveTripToSession(): void {
    sessionStorage.setItem('tripCancellation', JSON.stringify(this.tripCancellation));
  }




  fillPolicyOffer() {

    const roadAssistanceInsuranceJSON = sessionStorage.getItem('roadAssistanceInsurance');

    if (roadAssistanceInsuranceJSON) {
      const roadAssistanceInsurance = JSON.parse(roadAssistanceInsuranceJSON);

      this.roadAssistanceInsurance=roadAssistanceInsurance
      console.log("usaoo ", roadAssistanceInsurance)
      // this.fillRoadAssistanceInsurance();
      if (roadAssistanceInsurance.startDate) {
        this.selectedStartDate = roadAssistanceInsurance.startDate;
      }

      if (roadAssistanceInsurance.endDate) {
        this.selectedEndDate = roadAssistanceInsurance.endDate;
      }
      this.road.platesNumber = roadAssistanceInsurance.platesNumber? roadAssistanceInsurance.platesNumber: ''
      this.road.chassisNumber = roadAssistanceInsurance.chassisNumber? roadAssistanceInsurance.chassisNumber: ''
      this.road.vehicleBrand = roadAssistanceInsurance.vehicleBrand? roadAssistanceInsurance.vehicleBrand: ''
      this.road.vehicleType = roadAssistanceInsurance.vehicleType
      this.road.yearOfProduction = roadAssistanceInsurance.yearOfProduction
    }

  }

  private saveToSession(): void {
    sessionStorage.setItem('roadAssistanceInsurance', JSON.stringify(this.roadAssistanceInsurance));
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


  onValueChangeyearOfProduction(value: string) {
    if (!this.roadAssistanceInsurance) {
      this.roadAssistanceInsurance = {};
    }
    this.roadAssistanceInsurance.yearOfProduction = value;

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

    this.selectedStartDate = startDate.toISOString().slice(0, 11) + "23:59:59";

    

    sessionStorage.setItem('selectedStartDate', JSON.stringify( this.selectedStartDate));

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    this.selectedEndDate = endDate.toISOString().slice(0, 11) + "23:59:59";



    // this.selectedStartDate=this.selectedStartDate.slice(0, 11) + "23:59:59"
    // this.selectedEndDate =this.selectedEndDate

    console.log("StartDate",  this.selectedStartDate)
    console.log("EndDate",  this.selectedEndDate)

    this.roadAssistanceInsurance.startDate = this.selectedStartDate;
    this.roadAssistanceInsurance.endDate = this.selectedEndDate;

    this.saveToSession();

    this.roadChange.emit(this.roadAssistanceInsurance);
  }
  

  onValueChangePrice(value: string) {
    if (!this.tripCancellation) {
      this.tripCancellation = {};
    }
    this.tripCancellation.price = parseInt(value);
    this.saveTripToSession();
    this.tripCancellation.price = parseInt(value);
    // this.tripChange.emit(this.tripCancellation);
  }


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
