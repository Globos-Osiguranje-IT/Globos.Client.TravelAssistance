import { CommonModule, DecimalPipe, registerLocaleData } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, LOCALE_ID, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GbsDatePickerComponent } from 'ng-globos-core';
import { GbsButtonComponent } from 'ng-globos-core';
import { Router } from '@angular/router';
import { Icons } from '../../enums';
import { MatIconModule } from '@angular/material/icon';
import { CodebookResponse, InsuranceAdditionalCoverageResponse, InsuranceTypeResponse } from '../../http/dto/responses/codebook-response.model';
import { InsuranceAdditionalCoverageEnum } from '../../enums';
import { InsurenceType } from '../../enums';
import { CodebookClientService } from '../../http/codebook-client.service';
import { InsurnaceTypeService } from '../../services/insurnace-type.service';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { LoaderService } from '../../services/loader.service';
import { PolicyClientService } from '../../http/policy-client.service';
import { AdditionalInsuranceClientRequest } from '../../http/dto/requests/additional-insurance-client-request.model';
import { AdditionalInsuranceClientResponse } from './model/insuranceAdditionals.model';
import { Subscription } from 'rxjs';
import localeSr from '@angular/common/locales/sr';
import { MatDialog } from '@angular/material/dialog';
import { ModalDomPnpComponent } from './ModalDomacinstvoPnp/modal-dom-pnp.component';

registerLocaleData(localeSr); // 🇷🇸 Register Serbian locale

@Component({
  selector: 'gbs-insurance-additionals-feature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    GbsDatePickerComponent,
    GbsButtonComponent,
    MatIconModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'sr' }],
  templateUrl: './insurance-additionals-feature.component.html',
  styleUrl: './insurance-additionals-feature.component.scss',
})
export class InsuranceAdditionalsFeatureComponent implements OnInit {

  @Input() selectedPolicyType: InsuranceTypeResponse | null = null;
  @Input() startDateInput: string = "";//start date na jednokratnom osiguranju
  @Input() endDateInput: string = ""; //end date na jednokratnom osiguranju
  @Input() startDateAnnual: string = ""; //start date na godisnjem osiguranju
  @Input() amount: number | null = null;
  @Output() nextClicked = new EventEmitter<void>();

  insuranceType: InsurenceType = InsurenceType.JEDNOKRATNO;

  today: Date = new Date();

  startDate = new FormControl();
  endDate = new FormControl();
  canProceed: boolean = false;

  airplaneInflight: Icons = Icons.AirplaneInflight;
  endDateShow: boolean = false;

  nextButtonStyles = {
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'gap': '10px',
    'color': 'white',
    'font-weight': 'bold',
    'font-size': '18px',
    'text-align': 'center',
    'background-color': '#ff7f3f',
    'border-radius': '8px',
    'padding': '12px 30px',
    'min-width': '140px',
    'max-width': '160px',
    'height': '50px',
    'box-shadow': '0px 4px 6px rgba(0, 0, 0, 0.1)',
    'border': 'none',
    'cursor': 'pointer',
    'transition': 'transform 0.1s ease-in-out'
  };

  visibleOptions: InsuranceAdditionalCoverageResponse[] = [];
  visibleOptionsFooter: InsuranceAdditionalCoverageResponse[] = [];

  policyType: CodebookResponse | null = null;

  toggleValue = false;
  private sub: Subscription = new Subscription();

  constructor(private router: Router,
    private cashedSession: CashedCodebookClientService,
    private loader: LoaderService,
    private policyClientService: PolicyClientService,
    private insTypeService: InsurnaceTypeService,
    private dialog: MatDialog
  ) { }


  ngOnInit(): void {
    const savedToggles = JSON.parse(sessionStorage.getItem('insuranceToggles') || '{}');

    this.insTypeService.policyType$.subscribe(policyType => {
      this.policyType = policyType;
      this.updateNextButtonState();
    });

    this.insTypeService.amount$.subscribe((amount) => {
      this.amount = amount;
      // console.log('Received amount:', this.amount);
    });

    this.cashedSession.getInsurenceAdditionalCoverage().subscribe({
      next: (res: InsuranceAdditionalCoverageResponse[]) => {
        const filtered = res.filter((item: InsuranceAdditionalCoverageResponse) => item.isSurcharger === false);

        // filtered.forEach(el => console.log('Loaded option:', el.name, 'id:', el.id));

        this.visibleOptionsFooter = filtered.map(el => ({
          ...el,
          checked: savedToggles[el.id] || false  // ⬅️ KLJUČNA IZMJENA
        }));

        this.updateNextButtonState();
      },
      error: (error) => console.error("Error: ", error)
    });

  }

  private evaluateInsuranceTogglesVisibility(): void {
    if (!this.shouldShowToggles) {
      [InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA,
      InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU]
        .forEach(id => {
          const option = this.visibleOptionsFooter.find(o => o.id === id);
          if (option?.checked) {
            option.checked = false;
            this.getAdditionalInsuranceAmount(option, false);
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startDateInput'] || changes['endDateInput'] || changes['selectedPolicyType']) {
      this.evaluateInsuranceTogglesVisibility();
    }
  }

  onToggleChanged(option: any): void {
    this.getAdditionalInsuranceAmount(option, option.checked);
    this.updateNextButtonState();
  }

  updateInsuranceType() {
    this.updateNextButtonState();
  }

  updateStartDate(event: string) {
    this.startDate.setValue(event);
    this.updateNextButtonState();
  }

  updateEndDateManual(event: string) {
    this.endDate.setValue(event);
    this.updateNextButtonState();
  }

  updateNextButtonState() {
    const hasStartDate = !!this.startDate.value;
    const hasEndDate = this.policyType?.id === InsurenceType.GODISNJE || !!this.endDate.value;
    const hasSelectedInsurance = this.visibleOptions.some(option => option.isActive);

    if (hasEndDate) {
      this.endDateShow = true;
    }
    else {
      this.endDateShow = false;
    }

    this.canProceed = hasStartDate && hasEndDate && hasSelectedInsurance;
    this.evaluateInsuranceTogglesVisibility();
  }

  getAdditionalInsuranceAmount(option: any, checked: boolean) {

    const savedToggles = JSON.parse(sessionStorage.getItem('insuranceToggles') || '{}');
    savedToggles[option.id] = checked;

    sessionStorage.setItem('insuranceToggles', JSON.stringify(savedToggles));

    if (checked) {

      let request: AdditionalInsuranceClientRequest = JSON.parse(sessionStorage.getItem('additionalInsuranceRequest') || '{}');
      let responseHome: AdditionalInsuranceClientResponse = this.policyClientService.responseHome;
      let responseTraffic: AdditionalInsuranceClientResponse = this.policyClientService.responseTraffic;


      var shouldPost = false;

      if (
        (request.durationDays == null || responseHome.durationDays == null ||
          (option.id === InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA && (responseHome.durationDays !== request.durationDays))
        )
        ||
        (request.durationDays == null || responseTraffic.durationDays == null ||
          (option.id === InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU && (responseTraffic.durationDays !== request.durationDays))
        )
      ) {
        shouldPost = true;
      }

      if (shouldPost) {
        this.loader.show();
        this.policyClientService.postAdditionalInsurance(option.id).subscribe(result => {
          // console.log("STA JE RESULT: ", result)
          if (result) {
            result.durationDays = request.durationDays;
            if (option.id === InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA) {
              this.policyClientService.responseHome = result;
              if (!this.policyClientService.selectedAdditionalInsurances.includes(InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA)) {
                this.policyClientService.selectedAdditionalInsurances.push(InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA);
                sessionStorage.setItem('SelectedAdditionalInsurances', JSON.stringify(this.policyClientService.selectedAdditionalInsurances))
                sessionStorage.setItem('responseHomeInsurance', JSON.stringify(this.policyClientService.responseHome))
              }
            }
            if (option.id === InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU) {
              this.policyClientService.responseTraffic = result;
              if (!this.policyClientService.selectedAdditionalInsurances.includes(InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU)) {
                this.policyClientService.selectedAdditionalInsurances.push(InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU);
                sessionStorage.setItem('SelectedAdditionalInsurances', JSON.stringify(this.policyClientService.selectedAdditionalInsurances))
                sessionStorage.setItem('responseTrafficInsurance', JSON.stringify(this.policyClientService.responseTraffic))
              }
            }
            this.loader.hide();
          }
          else {
            this.loader.hide();
          }
        })
      }
    }
    else {
      if (option.id === InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA) {
        this.policyClientService.responseHome = {} as AdditionalInsuranceClientResponse;
        if (this.policyClientService.selectedAdditionalInsurances.includes(InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA)) {
          this.policyClientService.selectedAdditionalInsurances = this.policyClientService.selectedAdditionalInsurances.filter(item => item !== InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA);
          sessionStorage.setItem('SelectedAdditionalInsurances', JSON.stringify(this.policyClientService.selectedAdditionalInsurances));
          sessionStorage.removeItem('responseHomeInsurance');
        }
      }
      else if (option.id === InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU) {
        this.policyClientService.responseTraffic = {} as AdditionalInsuranceClientResponse;
        if (this.policyClientService.selectedAdditionalInsurances.includes(InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU)) {
          this.policyClientService.selectedAdditionalInsurances = this.policyClientService.selectedAdditionalInsurances.filter(item => item !== InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU);
          sessionStorage.setItem('SelectedAdditionalInsurances', JSON.stringify(this.policyClientService.selectedAdditionalInsurances));
          sessionStorage.removeItem('responseTrafficInsurance');
        }
      }
    }
  }


  getSelectedCoverageTotal() {
    const coverageTotal = this.visibleOptions.reduce((sum, option) => sum + (option.isActive ? option.price : 0), 0);

    const osigDom = this.policyClientService.responseHome;
    const pomocNaPutu = this.policyClientService.responseTraffic;

    // console.log("OSIG DOM: ", osigDom.finalAmount);
    // console.log("POMOC NA PUTU: ", pomocNaPutu.finalAmount);

    const total = coverageTotal + (this.amount!);
    let finalAmountTotal = 0;

    if (total != null) {
      if (osigDom.finalAmount != undefined && pomocNaPutu.finalAmount != undefined) {
        finalAmountTotal = total + osigDom.finalAmount + pomocNaPutu.finalAmount;
      }
      else if (osigDom.finalAmount != undefined && pomocNaPutu.finalAmount == undefined) {
        finalAmountTotal = total + osigDom.finalAmount;
      }
      else if (osigDom.finalAmount == undefined && pomocNaPutu.finalAmount != undefined) {
        finalAmountTotal = total + pomocNaPutu.finalAmount;
      }
      else {
        finalAmountTotal = total;
      }
    }

    return (finalAmountTotal);
  }

  goToNextStep() {
    // console.log("GO TO NEXT STEP: ", this.canProceed);
    this.nextClicked.emit();
    //this.router.navigate(['putno-osiguranje', 'passanger'])

  }

  // openModalDomPnp() {
  //   const dialogRef = this.dialog.open(ModalDomPnpComponent, {
  //     width: '90vw',        // Viewport width
  //     maxWidth: '400px',    // Max width on larger screens
  //     maxHeight: '90vh',    // Prevent overflow on small screens
  //     autoFocus: false,
  //     disableClose: true,
  //     data: {
  //       selectedPolicyType: this.selectedPolicyType,
  //       startDateInput: this.startDateInput,
  //       endDateInput: this.endDateInput,
  //       startDateAnnual: this.startDateAnnual,
  //       amount: this.amount
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result === 'proceed') {
       
  //     }
  //   });
  // }

  get shouldShowToggles(): boolean {
    var isJednokratno = this.selectedPolicyType?.id === InsurenceType.JEDNOKRATNO;
    var isUnder31Days = this.getDurationDays() <= 30;
    return isJednokratno && isUnder31Days;
  }

  getDurationDays(): number {
    var start = new Date(this.startDateInput);
    var end = new Date(this.endDateInput);
    var diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
