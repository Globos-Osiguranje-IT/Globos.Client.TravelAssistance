import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GbsInputComponent, GbsAutocompleteComponent } from 'ng-globos-core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoadAssistanceInsurance, DomesticInsurance, TripCancellation } from '../../../http/dto/requests/policy.model';
import { AdditionalCoverageTextEnum, InsuranceAdditionalCoverageEnum } from '../../../enums';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
import { TravelAgencies, TravelAgenciesComplete } from '../model/domestic-road-travel.model';
import { AllValidationsDirective } from '../../../validations/client-validation/allValidations';
import { Client } from '../../contractor-info/model/gbs-contractor-info.model';

@Component({
  selector: 'gbs-domestic-road-travel',
  standalone: true,
  imports: [CommonModule, FormsModule, GbsInputComponent, GbsAutocompleteComponent, AllValidationsDirective],
  templateUrl: './gbs-domestic-road-travel.component.html',
  styleUrl: './gbs-domestic-road-travel.component.scss'
})
export class GbsDomesticRoadTravelComponent {

  road: RoadAssistanceInsurance = {
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
  @Output() domesticChange = new EventEmitter<DomesticInsurance>();
  @Output() tripChange = new EventEmitter<TripCancellation>();

  constructor(private cashedSessionService: CashedCodebookClientService) { }

  ngOnInit(): void {
    this.fillPolicyOffer();

    if (this.roadAssistanceInsurance)
      this.road = this.roadAssistanceInsurance;

    if (this.domesticInsurance)
      this.domestic = this.domesticInsurance;

    if(this.tripCancellation)
      this.trip = this.tripCancellation;

    this.fillPolicyOffer()
  }

  private saveTripToSession(): void {
    sessionStorage.setItem('tripCancellation', JSON.stringify(this.tripCancellation));
  }

  mapAgenciesToAutocomplete(agencies: TravelAgencies[]): TravelAgenciesComplete[] {
    return agencies.map((agency) => ({
      label: agency.name,
      value: agency.id.toString(),
      cid: agency.name || ''
    }));
  }

  fillPolicyOffer() {

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


    this.cashedSessionService.getTravelAgency().subscribe({
      next: (res) => {
        // console.log("agencije")
        // console.log(res)
        this.items_travelAgenciesComplete = this.mapAgenciesToAutocomplete(res);

        const savedTrip = sessionStorage.getItem('tripCancellation');
        if (savedTrip) {
          this.tripCancellation = JSON.parse(savedTrip);

          const selectedId = this.tripCancellation.travelAgencyId.toString();
          const agency = this.items_travelAgenciesComplete.find(a => a.value === selectedId);
          if (agency) {
            this.selectedAgency = agency;
          }
        }
      },
      error: (error) => console.error("Erorr: ", error)
    })
  }

  private saveToSession(): void {
    sessionStorage.setItem('roadAssistanceInsurance', JSON.stringify(this.roadAssistanceInsurance));
    sessionStorage.setItem('domesticInsurance', JSON.stringify(this.domesticInsurance));
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

  onValueChangeAddress(value: string) {
    if (!this.domesticInsurance) {
      this.domesticInsurance = {};
    }
    this.domesticInsurance.address = value;

    this.saveToSession();

    this.domesticChange.emit(this.domesticInsurance);
  }

  onValueChangeContractNumber(value: string) {
    if (!this.tripCancellation) {
      this.tripCancellation = {};
    }
    this.tripCancellation.contractNumber = value;
    this.saveTripToSession();

    this.saveToSession();

    this.tripChange.emit(this.tripCancellation);
  }


  onValueChangePrice(value: string) {
    if (!this.tripCancellation) {
      this.tripCancellation = {};
    }
    this.tripCancellation.price = parseInt(value);
    this.saveTripToSession();
    this.tripCancellation.price = parseInt(value);
    this.tripChange.emit(this.tripCancellation);
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
    this.tripChange.emit(this.tripCancellation);
  }



}
