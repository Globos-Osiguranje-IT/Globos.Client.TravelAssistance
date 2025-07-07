import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { Icons } from '../../../enums';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PolicyTypeComponent } from '../../../components/policy-type/policy-type.component';
import { InsuranceTypePeriodPackageResponse, InsuranceTypeResponse } from '../../../http/dto/responses/codebook-response.model';
import { InsurantsPerAgeGroups } from '../../../http/dto/requests/policy.model';
import { InsuranceFeatureModel, InsuranceTypeAnnualModel } from '../model/insuranceType.model';


interface Tariff {
  groupId: string;
  coverageName: string;
  coverageWorldwide: string;
  territory: string;
  dayRates: { [key: string]: number };
  note?: string;
}

interface CoverageResult {
  tariff: Tariff;
  finalPrice: number;
  oldPrice: number;
}

const TARIFFS: Tariff[] = [
  {
    groupId: '1.1.1',
    coverageName: 'STANDARD 30.000€',
    coverageWorldwide: 'CEO SVET',
    territory: 'Sve zemlje sveta osim SAD, Kanade, Australije, NZ, Japana...',
    dayRates: {
      'do19_do60': 122,
      'do19_61-183': 108,
      '20-70_do60': 182,
      '20-70_61-183': 160,
      '71+_do60': 485,
    },
  },
  {
    groupId: '1.1.2',
    coverageName: 'STANDARD 15.000€',
    coverageWorldwide: 'CEO SVET',
    territory: 'Sve zemlje sveta (osim nekih u uslovima)',
    dayRates: {
      'do19_do60': 427,
      'do19_61-183': 363,
      '20-70_do60': 656,
      '20-70_61-183': 558,
      '71+_do60': 1641,
    },
  },
  {
    groupId: '1.1.3',
    coverageName: 'STANDARD 30.000€',
    coverageWorldwide: 'CEO SVET',
    territory: 'Sve zemlje sveta (osim nekih u uslovima)',
    dayRates: {
      'do19_do60': 478,
      'do19_61-183': 408,
      '20-70_do60': 735,
      '20-70_61-183': 642,
      '71+_do60': 1838,
    },
  },
];

@Component({
  selector: 'gbs-insurance-type-feature',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
    CdkScrollableModule, PolicyTypeComponent
  ],
  templateUrl: './insurance-type-feature.component.html',
  styleUrl: './insurance-type-feature.component.scss'
})
export class InsuranceTypeFeatureComponent {

  @Input() policies: InsuranceTypeResponse[] = [];
  @Input() isFamilySelected: boolean = false;
  @Input() selectedPolicy?: InsuranceTypeResponse;
  @Input() selectedAdditionalCoverages: number[]=[]
  @Input() selectedStartDate: string = '';
  @Input() selectedEndDate: string = '';
  @Input() selectedDate: string = '';
  @Input() passengers: { [key: string]: number } = {};
  @Input() isInSerbia: boolean | null = null;
  @Input() selectedAnnualDay?: InsuranceTypePeriodPackageResponse;
  @Input() days: number = 1;
  @Input() dateAndPassengers?: InsuranceFeatureModel;
  @Input() dateAndPassengersAnnual?: InsuranceTypeAnnualModel;

  @Output() typeSelected = new EventEmitter<InsuranceTypeResponse>();
  @Output() dateAndPassengersChanged = new EventEmitter<InsuranceFeatureModel>();
  @Output() dateAndPassengersAnnualChanged = new EventEmitter<InsuranceTypeAnnualModel>();

  ////VALIDACIJA
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

  airplaneTakeoff: Icons = Icons.AirplaneTakeOff;

  showTerritoryCheck: boolean = false;
  showDateAdjustedMessage: boolean = false;
  territoryAnswer: boolean | null = null;
  territoryError: boolean = false;

  coverageResults: CoverageResult[] = [];

  maxDate: Date = new Date(2100, 0, 1);
  minDate: Date = new Date(1940, 0, 1);

  constructor(
  ) { }

  ngOnInit(): void {
    if (this.dateAndPassengers) {
      this.passengers ={'age0': this.dateAndPassengers?.passengers?.[0]?.number || 0, 
                        'age20': this.dateAndPassengers?.passengers?.[1]?.number || 0,
                        'age71': this.dateAndPassengers?.passengers?.[2]?.number || 0}

      this.selectedStartDate = this.dateAndPassengers?.startDate || '';
      this.selectedEndDate = this.dateAndPassengers?.endDate || '';
      this.isInSerbia = this.dateAndPassengers?.isInSerbia || null;
      // this.days = this.dateAndPassengers?.numberOfDays || 1;
      
    } 
    else {
      this.passengers ={'age0': this.dateAndPassengersAnnual?.passengers?.[0]?.number || 0, 
        'age20': this.dateAndPassengersAnnual?.passengers?.[1]?.number || 0,
        'age71': this.dateAndPassengersAnnual?.passengers?.[2]?.number || 0}
      this.selectedDate = this.dateAndPassengersAnnual?.startDate || '';
     this.selectedAnnualDay = this.dateAndPassengersAnnual?.days || undefined;
      this.isInSerbia = this.dateAndPassengersAnnual?.isInSerbia || null;
    }

    // console.log("==========++++++++++ SVE SELEKTOVANO STO SE TICE INS TYPE ++++++++++==========")
    // console.log("Selected policy: ", this.selectedPolicy);
    // console.log("Selected start date: ", this.selectedStartDate);
    // console.log("Selected end date: ", this.selectedEndDate);
    // console.log("Selected date: ", this.selectedDate);
    // console.log("Selected passengers: ", this.passengers);
    // console.log("Selected isInSerbia: ", this.isInSerbia);
    // console.log("Selected annual day: ", this.selectedAnnualDay);
    // console.log("selectedDaysOptions: ", this.selectedDaysOptions);
    // console.log("Selected days: ", this.days);
  }

  openDatepicker(picker: MatDatepicker<any>) {
    picker.open();
  }

  private calculateDateDifference(date1: Date, date2: Date): number {
    const diff = date1.getTime() - date2.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  onDateChange(event: any) {
    this.selectedDate = event;
    // console.log('Selected Date:', this.selectedDate);
  }

  onTypeSelected(event: InsuranceTypeResponse) {
    this.typeSelected.emit(event);
  }

  onDateAndPassengersChanged(event: InsuranceFeatureModel) {
    this.dateAndPassengersChanged.emit(event);
  }

  onDateAndPassengersAnnualChanged(event: InsuranceTypeAnnualModel) {
    this.dateAndPassengersAnnualChanged.emit(event);
  }
}
