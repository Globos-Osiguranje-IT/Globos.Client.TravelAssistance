import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateAndPassengersComponent } from "../date-and-passengers/date-and-passengers.component";
import { CodebookResponse, InsuranceTypePeriodPackageResponse, InsuranceTypeResponse, InsuredAgeGroupsResponse } from '../../http/dto/responses/codebook-response.model';
import { InsurnaceTypeService } from '../../services/insurnace-type.service';
import { InsurantsPerAgeGroups } from '../../http/dto/requests/policy.model';
import { InsuranceFeatureModel, InsuranceTypeAnnualModel } from '../../features/insurance-type-feature/model/insuranceType.model';

@Component({
  selector: 'gbs-policy-type',
  standalone: true,
  imports: [CommonModule, DateAndPassengersComponent],
  templateUrl: './policy-type.component.html',
  styleUrl: './policy-type.component.scss'
})
export class PolicyTypeComponent {

  @Input() policies: InsuranceTypeResponse[] = [];
  @Input() isFamilySelected: boolean = false;
  @Input() selectedAdditionalCoverages: number[]=[]

  @Input() dateAndPassengers?: InsuranceFeatureModel;
  @Input() dateAndPassengersAnnual?: InsuranceTypeAnnualModel;

  @Input() selectedPolicy?: InsuranceTypeResponse;
  @Input() selectedStartDate: string = '';
  @Input() selectedEndDate: string = '';
  @Input() selectedDate: string = '';
  @Input() passengers: { [key: string]: number } = {
    age0: 0,
    age20: 0,
    age71: 0
  };
  @Input() isInSerbia: boolean | null = null;
  @Input() selectedAnnualDay?: InsuranceTypePeriodPackageResponse;
  @Input() days: number = 1;

  @Output() typeSelected = new EventEmitter<CodebookResponse>();
  @Output() dateAndPassengersChanged = new EventEmitter<InsuranceFeatureModel>();
  @Output() dateAndPassengersAnnualChanged = new EventEmitter<InsuranceTypeAnnualModel>();

  //VALIDACIJE
  @Input() showStartDateError: boolean = false;
  @Input() showEndDateError: boolean = false;
  @Input() showTerritoryError: boolean = false;
  @Input() showTerritoryErrorAnnual: boolean = false;
  @Input() showStartDateMinError: boolean = false;
  @Input() showPassengerGroupEmptyError: boolean = false;
  @Input() showPassengerLimitExceededError: boolean = false;
  @Input() showPassengerGroupEmptyErrorAnnual: boolean = false;
  @Input() showPassengerLimitExceededErrorAnnual: boolean = false;
  @Input() show71Error:boolean=false
  @Input() show71ErrorAnnual:boolean=false
  @Input() showDurationError: boolean=false;
  @Input() showNumberOfDaysError:boolean=false;
  @Input() selectedDaysOptions?: InsuranceTypePeriodPackageResponse[];


  // TRENUTNO JE ZAKUCANO, jer nije napravljena metoda na API-ju da dovlaci podatke o InsuredAgeGroups
  ageGroups: InsuredAgeGroupsResponse[] = [
    { id: 1, ageFrom: 0, ageTo: 19 },
    { id: 2, ageFrom: 20, ageTo: 70 },
    { id: 3, ageFrom: 71, ageTo: 150 }
  ];

  passengersAgeGroups?: InsurantsPerAgeGroups[];

  constructor(private policyTypeService: InsurnaceTypeService) { }

  ngOnInit(): void {

    // console.log("STA JE SELCETED POLICY U POLICY TYPE: ", this.selectedPolicy)
    // if (this.dateAndPassengers) {
    //   this.passengers ={'age0': this.dateAndPassengers?.passengers?.[0]?.number || 0, 
    //                     'age20': this.dateAndPassengers?.passengers?.[1]?.number || 0,
    //                     'age71': this.dateAndPassengers?.passengers?.[2]?.number || 0}

      // this.selectedStartDate = this.dateAndPassengers?.startDate || '';
      // this.selectedEndDate = this.dateAndPassengers?.endDate || '';
      // this.isInSerbia = this.dateAndPassengers?.isInSerbia || null;
      // this.days = this.dateAndPassengers?.numberOfDays || 1;
      
    // } 
    // else {
    //   this.passengers ={'age0': this.dateAndPassengersAnnual?.passengers?.[0]?.number || 0, 
    //     'age20': this.dateAndPassengersAnnual?.passengers?.[1]?.number || 0,
    //     'age71': this.dateAndPassengersAnnual?.passengers?.[2]?.number || 0}
      // this.selectedDate = this.dateAndPassengersAnnual?.startDate || '';
      // this.selectedAnnualDay = this.dateAndPassengersAnnual?.days || undefined;
      // this.isInSerbia = this.dateAndPassengersAnnual?.isInSerbia || null;
    // }

    // console.log("==========++++++++++ SVE SELEKTOVANO STO SE TICE INS TYPE ++++++++++==========")
    // console.log("Selected policy: ", this.selectedPolicy);
    // console.log("Selected start date: ", this.selectedStartDate);
    // console.log("Selected end date: ", this.selectedEndDate);
    // console.log("Selected date: ", this.selectedDate);
    // console.log("Selected passengers: ", this.passengers);
    // console.log("Selected isInSerbia: ", this.isInSerbia);
    // console.log("Selected annual day: ", this.selectedAnnualDay);
    // console.log("Selected days: ", this.days);
  }

  selectPolicy(policy: InsuranceTypeResponse): void {
    this.selectedPolicy = policy;
    this.policyTypeService.setPolicyType(this.selectedPolicy);
    this.passengers = { age0: 0, age20: 0, age71: 0 };
    this.passengersAgeGroups = [];

    this.policyTypeService.setStartDate("");
    this.selectedStartDate = "";
    this.selectedEndDate = "";

    this.policyTypeService.setEndDate("");

    this.typeSelected.emit(policy);
  }

  onDateAndPassengersChanged(event: InsuranceFeatureModel): void {
    // this.selectedStartDate = event.startDate;
    // this.selectedEndDate = event.endDate;
    // this.passengersAgeGroups = event.passengers;

    this.dateAndPassengersChanged.emit(event);

    // console.log("Selected event: ", event);
  }

  onDateAndPassengersAnnualChanged(event: InsuranceTypeAnnualModel): void {
   this.dateAndPassengersAnnualChanged.emit(event);
    // console.log("Selected event: ", event);
  }
}

