import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { GbsDatePickerComponent, GbsInputComponent, GbsRadioComponent } from 'ng-globos-core';
import { Icons, InsuranceAdditionalCoverageEnum, InsurenceType } from '../../enums';
import { InsuranceTypePeriodPackageResponse, InsuranceTypeResponse, InsuredAgeGroupsResponse } from '../../http/dto/responses/codebook-response.model';
import { InsurnaceTypeService } from '../../services/insurnace-type.service';
import { InsurantsPerAgeGroups } from '../../http/dto/requests/policy.model';
import { InsuranceFeatureModel, InsuranceTypeAnnualModel } from '../../features/insurance-type-feature/model/insuranceType.model';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { PolicyClientService } from '../../http/policy-client.service';


@Component({
  selector: 'gbs-date-and-passengers',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
    GbsDatePickerComponent, CdkScrollableModule, GbsRadioComponent, GbsInputComponent],
  templateUrl: './date-and-passengers.component.html',
  styleUrl: './date-and-passengers.component.scss'
})
export class DateAndPassengersComponent {

  @Input() selectedPolicy?: InsuranceTypeResponse;
  @Input() ageGroups: InsuredAgeGroupsResponse[] = [];
  @Input() passengers: { [key: string]: number } = {
    age0: 0,
    age20: 0,
    age71: 0
  };
  //Start date na jednokratnom osiguranju
  @Input() selectedStartDate: string = '';

  //End date na jednokratnom osiguranju
  @Input() selectedEndDate: string = '';

  //Start date na godisnjem osiguranju
  @Input() selectedDate: string = '';
  @Input() isInSerbia: boolean | null = null;
  @Input() days: number | any = 1;
  @Input() selectedAnnualDay?: InsuranceTypePeriodPackageResponse;
  @Input() dateAndPassengersAnnual?: InsuranceTypeAnnualModel;


  @Output() dateAndPassengersChanged = new EventEmitter<InsuranceFeatureModel>();
  @Output() dateAndPassengersAnnualChanged = new EventEmitter<InsuranceTypeAnnualModel>();

  ///ZA VALIDACIJE
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
  @Input() selectedAdditionalCoverages: number[]=[]

  @Input() isFamilySelected : boolean=false;

 hasWorkVisa : boolean = false;
 hasWorkVisaAdmin : boolean = false;

  passengersAgeGroups?: InsurantsPerAgeGroups[] = [];
  passengersAgeGroupsAnnual?: InsurantsPerAgeGroups[]=[];

  @Input() selectedDaysOptions?: InsuranceTypePeriodPackageResponse[];
  today: Date = new Date();

  airplaneTakeoff: Icons = Icons.AirplaneTakeOff;
  airplaneLanding: Icons = Icons.AirplaneLanding;

  maxDate: Date = new Date(2100, 0, 1);
  minDate: Date | null = new Date(1940, 0, 1);

  age19: number = 0;
  age70: number = 0;
  age71: number = 0;

  endDate: any = '';

  showPassengerCountError: boolean = false;

  previousIsInSerbia: boolean | null = null; // Praćenje prethodne vrednosti
  isRadioChangeInProgress = false; // Dodajemo flag koji označava da li je promena u toku

  selectedJEDNOKRATNO: InsurenceType = InsurenceType.JEDNOKRATNO;
  selectedGODISNJE: InsurenceType = InsurenceType.GODISNJE;

  constructor(private insTypService: InsurnaceTypeService, private cashedService: CashedCodebookClientService, private policyClientService: PolicyClientService) { }

  ngOnInit() {

    console.log("selectedStartDate", this.selectedStartDate)

    this.passengersAgeGroups = [
      {
        ageGroupId: 1,
        number: this.passengers['age0']
      },
      {
        ageGroupId: 2,
        number: this.passengers['age20']
      },
      {
        ageGroupId: 3,
        number: this.passengers['age71']
      }
    ];

    if (this.dateAndPassengersAnnual && Array.isArray(this.dateAndPassengersAnnual.passengers) && this.dateAndPassengersAnnual.passengers.length > 0) {
      this.passengersAgeGroupsAnnual = [...this.dateAndPassengersAnnual.passengers];
    }

    if(this.selectedStartDate !=null){
      this.minDate=this.toDate(this.selectedStartDate)
    }
    // if(this.selectedStartDate && this.selectedEndDate && this.days > 0 && this.passengers) {
    //   this.dateAndPassengersChanged.emit({startDate: this.selectedStartDate, endDate: this.selectedEndDate, numberOfDays: this.days, passengers: this.passengersAgeGroups!, isInSerbia: this.isInSerbia});
    // }

  }

  onValueChangeDaysNumber(event: any){
    console.log("CHANGDE DAYS", event.target.value) // broj dana koji je korisnik rucno uneo preko input polja

      // 1) Parsiraj broj dana iz inputa
  const raw = event.target.value;
  const parsed = parseInt(raw, 10);
  // Ako nije broj, vrati na minimum 1
  this.days = isNaN(parsed) || parsed < 1 ? 1 : parsed;

  // 2) Ponovo izračunaj end date
  this.updateEndDate();

  // 3) Proveri da li je broj dana u dozvoljenom rasponu
  this.checkNumberOfDays();
  // (i ostale validacije tipa 71+ godina…)

  // 4) Emituj novi state
  this.dateAndPassengersChanged.emit({
    startDate: this.selectedStartDate,
    endDate: this.selectedEndDate,
    numberOfDays: this.days,
    passengers: this.passengersAgeGroups!,
    isInSerbia: this.isInSerbia
  })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedAdditionalCoverages']) {
      // Ovde reaguješ na promenu Input-a
      this.checkNumberOfDays();
    }
  }
  
  validateMinStartDate(dateStr: string) {
    const selectedDate = new Date(dateStr);
    const now = new Date();
    selectedDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0);
    const minAllowedDate = new Date(now);
    minAllowedDate.setDate(now.getDate() + 4);
    if(selectedDate<minAllowedDate){
      return true
    }
    return false
  }

  onStartDateChange(event: any) {
    this.days = 1;
    this.selectedStartDate = event;
    this.selectedEndDate = '';
    this.insTypService.setStartDate(event);
    this.showNumberOfDaysError=false;
    if(this.validateMinStartDate(this.selectedStartDate)==false){
      this.showTerritoryError=false;
      this.showTerritoryErrorAnnual=false;
      this.isInSerbia=true;
    }
    else{
      if(this.isInSerbia===true){
        this.isInSerbia=null;
      }
      else{
        this.isInSerbia=this.isInSerbia==false?false:null;
      }
    }

    if (this.isInSerbia === false && this.selectedStartDate) {
      this.showStartDateMinError = this.validateMinStartDate(this.selectedStartDate);
    } else {
      this.showStartDateMinError = false;
    }
    
    this.dateAndPassengersChanged.emit({ startDate: event, endDate: this.selectedEndDate, numberOfDays: this.days, passengers: this.passengersAgeGroups!, isInSerbia: this.isInSerbia });

  }

  onEndDateChange(event: any) {
    const start = new Date(this.selectedStartDate);
    const end = new Date(event);

    if (this.selectedStartDate && end < start) {
      this.showEndDateError = true;
      this.selectedEndDate = '';
      return;
    }

    this.selectedEndDate = event;
    this.calculateDays();
    //this.increaseDaysWith31();
    this.insTypService.setEndDate(event);

    this.checkNumberOfDays();
   
    this.dateAndPassengersChanged.emit({
      startDate: this.selectedStartDate,
      endDate: event,
      numberOfDays: this.days,
      passengers: this.passengersAgeGroups!,
      isInSerbia: this.isInSerbia
    });
  }

  increaseDays() {
    this.days++;
    this.updateEndDate();  
    console.log('DateAndPassengerComponent',this.selectedAdditionalCoverages);
  
    this.checkNumberOfDays();

    this.dateAndPassengersChanged.emit({ startDate: this.selectedStartDate, endDate: this.selectedEndDate, numberOfDays: this.days, passengers: this.passengersAgeGroups!, isInSerbia: this.isInSerbia });
  }

  decreaseDays() {
    if (this.days > 1) {
      this.days--;
      this.updateEndDate();
      this.checkNumberOfDays();

      this.dateAndPassengersChanged.emit({ startDate: this.selectedStartDate, endDate: this.selectedEndDate, numberOfDays: this.days, passengers: this.passengersAgeGroups!, isInSerbia: this.isInSerbia });
    }
  }

  increaseDaysWith31() {
    let start = new Date(this.selectedStartDate);
    let end = new Date(this.selectedEndDate);

    if (end.getMonth() > start.getMonth()) {
      if (this.isMonthWith31Days(start) && start.getDate() < 31) {
        this.days++;
      }
    }
  }

  calculateDays() {
    // if (this.selectedStartDate && this.selectedEndDate) {
    //   let start = new Date(this.selectedStartDate);
    //   let end = new Date(this.selectedEndDate);

    //   if (start && end) {
    //     let difference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    //     if (end.getDate() == 31) {
    //       difference += 1;
    //     }
    //     this.days = difference >= 0 ? difference : 0;
    //   }
    // }
    // else {
    //   this.days = 1;
    // }
    if (this.selectedStartDate && this.selectedEndDate) {
      let start = new Date(this.selectedStartDate);
      let end = new Date(this.selectedEndDate);
  
      if (start && end) {
        let difference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        this.days = difference >= 0 ? difference : 0;
      }
    } else {
      this.days = 1;
    }
  }

  updateEndDate() {
    if (this.selectedStartDate && this.days > 0) {
      let startDate = new Date(this.selectedStartDate);
      if (startDate) {
        startDate.setDate(startDate.getDate() + this.days - 1);

        this.selectedEndDate = startDate.toISOString();
        this.insTypService.setEndDate(this.selectedEndDate)
      }
    }
  }

  private isMonthWith31Days(date: Date): boolean {
    const monthsWith31Days = [0, 2, 4, 6, 7, 9, 11]; // Januar, Mart, Maj, Jul, Avgust, Oktobar, Decembar
    return monthsWith31Days.includes(date.getMonth());
  }

  increasePassenger(ageGroup: string) {
    this.passengers[ageGroup]++;

    this.passengersAgeGroups = [];
    this.passengersAgeGroupsAnnual=[];
    if(this.policyClientService.policyInfoOfferRequest.insuranceTypeId == this.selectedJEDNOKRATNO){
      this.passengersAgeGroups = [
        {
          ageGroupId: 1,
          number: this.passengers['age0']
        },
        {
          ageGroupId: 2,
          number: this.passengers['age20']
        },
        {
          ageGroupId: 3,
          number: this.passengers['age71']
        }
      ];
    }else{
      this.passengersAgeGroupsAnnual = [
        {
          ageGroupId: 1,
          number: this.passengers['age0']
        },
        {
          ageGroupId: 2,
          number: this.passengers['age20']
        },
        {
          ageGroupId: 3,
          number: this.passengers['age71']
        }
      ];
    }
   

    if(this.endDate === null || this.endDate === undefined || this.endDate === '' || this.endDate === 'Invalid date'){
      this.endDate = this.dateAndPassengersAnnual?.endDate;
    }

    // console.log("STA JE insTypeId: ", this.policyClientService.policyInfoOfferRequest.insuranceTypeId)
    if (this.policyClientService.policyInfoOfferRequest.insuranceTypeId == this.selectedJEDNOKRATNO) {
      this.dateAndPassengersChanged.emit({ startDate: this.selectedStartDate, endDate: this.selectedEndDate, numberOfDays: this.days, passengers: this.passengersAgeGroups!, isInSerbia: this.isInSerbia });
    }
    else {
      this.dateAndPassengersAnnualChanged.emit({ startDate: this.selectedDate, endDate: this.endDate, days: this.selectedAnnualDay, passengers: this.passengersAgeGroupsAnnual!, isInSerbia: this.isInSerbia  });
    }
  }

  decreasePassenger(ageGroup: string) {
    if (this.passengers[ageGroup] > 0) {
      this.passengers[ageGroup]--;
    }

    this.passengersAgeGroups = [];
    this.passengersAgeGroupsAnnual=[];
    if(this.policyClientService.policyInfoOfferRequest.insuranceTypeId == this.selectedJEDNOKRATNO){
      this.passengersAgeGroups = [
        {
          ageGroupId: 1,
          number: this.passengers['age0']
        },
        {
          ageGroupId: 2,
          number: this.passengers['age20']
        },
        {
          ageGroupId: 3,
          number: this.passengers['age71']
        }
      ];
    }else{
      this.passengersAgeGroupsAnnual = [
        {
          ageGroupId: 1,
          number: this.passengers['age0']
        },
        {
          ageGroupId: 2,
          number: this.passengers['age20']
        },
        {
          ageGroupId: 3,
          number: this.passengers['age71']
        }
      ];
    }

    if(this.endDate === null || this.endDate === undefined || this.endDate === '' || this.endDate === 'Invalid date'){
      this.endDate = this.dateAndPassengersAnnual?.endDate;
    }

    // console.log("STA JE insTypeId: ", this.policyClientService.policyInfoOfferRequest.insuranceTypeId)
    
    if (this.policyClientService.policyInfoOfferRequest.insuranceTypeId == this.selectedJEDNOKRATNO) {
      this.dateAndPassengersChanged.emit({ startDate: this.selectedStartDate, endDate: this.selectedEndDate, numberOfDays: this.days, passengers: this.passengersAgeGroups!, isInSerbia: this.isInSerbia });
    }
    else {
      this.dateAndPassengersAnnualChanged.emit({ startDate: this.selectedDate, endDate: this.endDate, days: this.selectedAnnualDay, passengers: this.passengersAgeGroupsAnnual!, isInSerbia: this.isInSerbia });
    }
  }

  onDateChange(event: any) {
    this.selectedDate = event;
    this.insTypService.setStartDate("");
    this.insTypService.setEndDate("");
    this.insTypService.setStartDateAnnual(event);
    this.endDate = new Date(event); // Clone the selected date
    this.endDate.setFullYear(this.endDate.getFullYear() + 1); // Add one year
    this.endDate.setDate(this.endDate.getDate() - 1); // Subtract one day

    if(this.validateMinStartDate(this.selectedDate)==false){
      this.showTerritoryError=false;
      this.showTerritoryErrorAnnual=false;
      this.isInSerbia=true;
    }else{
      if(this.isInSerbia===true){
        this.isInSerbia=null;
      }
      else{
        this.isInSerbia=this.isInSerbia==false?false:null;
      }
    }

    this.dateAndPassengersAnnualChanged.emit({ startDate: event, endDate: this.endDate, days: this.selectedAnnualDay, passengers: this.passengersAgeGroupsAnnual!, isInSerbia: this.isInSerbia  });

  }

  onStartDateBlur() {
    this.dateAndPassengersChanged.emit({
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
      numberOfDays: this.days,
      passengers: this.passengersAgeGroups!,
      isInSerbia: this.isInSerbia ?? null
    });
  }

  onStartDateAnnualBlur() {
    this.dateAndPassengersAnnualChanged.emit({
      startDate: this.selectedDate,
      endDate: this.endDate,
      days: this.selectedAnnualDay,
      passengers: this.passengersAgeGroupsAnnual!,
      isInSerbia: this.isInSerbia
    });
  }

  onEndDateBlur() {
    this.dateAndPassengersChanged.emit({
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
      numberOfDays: this.days,
      passengers: this.passengersAgeGroups!,
      isInSerbia: this.isInSerbia
    });

  }

  setAnnualDays(day: InsuranceTypePeriodPackageResponse) {
    this.selectedAnnualDay = day;

    this.endDate = new Date(this.selectedDate); // Clone the selected date
    this.endDate.setFullYear(this.endDate.getFullYear() + 1); // Add one year
    this.endDate.setDate(this.endDate.getDate() - 1); // Subtract one day

    if(this.endDate === null || this.endDate === undefined || this.endDate === '' || this.endDate === 'Invalid date'){
      this.endDate = this.dateAndPassengersAnnual?.endDate;
    }

    this.dateAndPassengersAnnualChanged.emit({ startDate: this.selectedDate, endDate: this.endDate, days: this.selectedAnnualDay, passengers: this.passengersAgeGroupsAnnual!, isInSerbia: this.isInSerbia  });
  }

  onRadioChange(event: any) {
    this.isInSerbia = event.value === 'Da';

    // console.log("DA", this.isInSerbia)

    this.showTerritoryError = false;
    this.showTerritoryErrorAnnual = false;
    
    if (this.policyClientService.policyInfoOfferRequest.insuranceTypeId == this.selectedJEDNOKRATNO){
      if (this.isInSerbia === false && this.selectedStartDate) {
        this.showStartDateMinError = this.validateMinStartDate(this.selectedStartDate);
      } else {
        this.showStartDateMinError = false;
      }
    }
    else{
      if (this.isInSerbia === false && this.selectedDate) {
        this.showStartDateMinError = this.validateMinStartDate(this.selectedDate);
      } else {
        this.showStartDateMinError = false;
      }
  
    }
   
    if(this.endDate === null || this.endDate === undefined || this.endDate === '' || this.endDate === 'Invalid date'){
      this.endDate = this.dateAndPassengersAnnual?.endDate;
    }

    // console.log("STA JE insTypeId: ", this.policyClientService.policyInfoOfferRequest.insuranceTypeId)

    if (this.policyClientService.policyInfoOfferRequest.insuranceTypeId == this.selectedJEDNOKRATNO) {
      this.dateAndPassengersChanged.emit({
        startDate: this.selectedStartDate,
        endDate: this.selectedEndDate,
        numberOfDays: this.days,
        passengers: this.passengersAgeGroups!,
        isInSerbia: this.isInSerbia
      });
    }
    else {
      this.dateAndPassengersAnnualChanged.emit({
        startDate: this.selectedDate,
        endDate: this.endDate,
        days: this.selectedAnnualDay,
        passengers: this.passengersAgeGroupsAnnual!,
        isInSerbia: this.isInSerbia
      });

    }
  }
  toDate(dateStr: string | Date | null): Date | null {
    if (!dateStr) return null;
  
    // Ako je već Date, samo vrati
    if (dateStr instanceof Date) {
      return dateStr;
    }
  
    // Ako je string
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
        const isoDate = new Date(dateStr);
        return isNaN(isoDate.getTime()) ? null : isoDate;
      }
  
      // 2) dd.MM.yyyy
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
  
      // 3) fallback: pokušaš generički JS parser
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? null : fallback;
    }
  
    return null;
  }

  checkNumberOfDays(){
    this.hasWorkVisa = this.selectedAdditionalCoverages?.includes(InsuranceAdditionalCoverageEnum.RADNA_VIZA_GRAD) ?? false;
    this.hasWorkVisaAdmin = this.selectedAdditionalCoverages?.includes(InsuranceAdditionalCoverageEnum.RADNA_VIZA_ADMIN) ?? false;
    
    this.showEndDateError = false;
    if (this.hasWorkVisa || this.hasWorkVisaAdmin){
      if(this.days>365){
        this.showNumberOfDaysError=true;
      }
    }else if(this.days>183){
      this.showNumberOfDaysError=true;
    }
    else{
      this.showNumberOfDaysError=false;
    }
  }
  
}
