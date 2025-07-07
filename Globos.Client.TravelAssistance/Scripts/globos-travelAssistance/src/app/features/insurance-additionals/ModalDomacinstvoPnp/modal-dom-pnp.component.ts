import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output, SimpleChanges } from '@angular/core';
import { GbsButtonComponent, GbsCheckboxComponent } from 'ng-globos-core';
import { CodebookResponse, InsuranceAdditionalCoverageResponse, InsuranceTypeResponse } from '../../../http/dto/responses/codebook-response.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
import { LoaderService } from '../../../services/loader.service';
import { PolicyClientService } from '../../../http/policy-client.service';
import { InsurnaceTypeService } from '../../../services/insurnace-type.service';
import { Subscription } from 'rxjs';
import { InsuranceAdditionalCoverageEnum, InsurenceType } from '../../../enums';
import { AdditionalInsuranceClientResponse } from '../model/insuranceAdditionals.model';
import { AdditionalInsuranceClientRequest } from '../../../http/dto/requests/additional-insurance-client-request.model';
import { MatButtonModule } from '@angular/material/button';
import localeSr from '@angular/common/locales/sr';
import { InfoPonudaPokricaComponent } from '../../../components/info-ponuda-pokrica/info-ponuda-pokrica.component';

registerLocaleData(localeSr); // 🇷🇸 Register Serbian locale

@Component({
  selector: 'app-modal-dom-pnp',
  standalone: true,
  imports: [CommonModule,
    GbsButtonComponent,
    GbsCheckboxComponent,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogModule],
  providers: [{ provide: LOCALE_ID, useValue: 'sr' }],

  templateUrl: './modal-dom-pnp.component.html',
  styleUrl: './modal-dom-pnp.component.scss'
})
export class ModalDomPnpComponent {
  @Input() selectedPolicyType: InsuranceTypeResponse | null = null;
  @Input() startDateInput: string = "";//start date na jednokratnom osiguranju
  @Input() endDateInput: string = ""; //end date na jednokratnom osiguranju
  @Input() startDateAnnual: string = ""; //start date na godisnjem osiguranju
  @Input() amount: number | null = null;

  @Output() nextClicked = new EventEmitter<void>();


  visibleOptions: InsuranceAdditionalCoverageResponse[] = [];
  visibleOptionsFooter: InsuranceAdditionalCoverageResponse[] = [];

  policyType: CodebookResponse | null = null;

  toggleValue = false;
  private sub: Subscription = new Subscription();

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

  constructor(private dialogRef: MatDialogRef<ModalDomPnpComponent>,
    private cashedSession: CashedCodebookClientService,
    private loader: LoaderService,
    private dialog: MatDialog,
    private policyClientService: PolicyClientService,
    private insTypeService: InsurnaceTypeService,
    @Inject(MAT_DIALOG_DATA) public data: { selectedPolicyType: InsuranceTypeResponse | null; amount: number; startDateInput: Date | string; endDateInput: Date | string; startDateAnnual: Date | string }) { }

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
          checked: savedToggles[el.id] || false, // ⬅️ KLJUČNA IZMJENA
          price: 0
        }));

        // Fetch price for each option
        this.visibleOptionsFooter.forEach(option => {
          this.policyClientService.postAdditionalInsurance(option.id).subscribe(result => {
            if (result && typeof result.finalAmount === 'number') {
              option.price = result.finalAmount;
            }
          });
        });

        this.updateNextButtonState();
      },
      error: (error) => console.error("Error: ", error)
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startDateInput'] || changes['endDateInput'] || changes['selectedPolicyType']) {
      this.evaluateInsuranceTogglesVisibility();
    }
  }

  openDetails(option: any) {

    // console.log("STA JE OPTION:", option)
      const dialogRef = this.dialog.open(InfoPonudaPokricaComponent, {
        width: '80vw',
        maxWidth: 'none',
        maxHeight: '90vh',
        panelClass: 'custom-dialog-container',
        data: { pnp: option.id}
      });
  
  
      dialogRef.afterClosed().subscribe(result => {
  
      });
    }

  updateNextButtonState() {
    this.evaluateInsuranceTogglesVisibility();
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

  get shouldShowToggles(): boolean {
    var isJednokratno = this.data.selectedPolicyType?.id === InsurenceType.JEDNOKRATNO;
    var isUnder31Days = this.getDurationDays() <= 30;
    return isJednokratno && isUnder31Days;
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

  getDurationDays(): number {
    var start = new Date(this.data.startDateInput);
    var end = new Date(this.data.endDateInput);
    var diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

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

  onToggleChanged(option: any): void {
    this.getAdditionalInsuranceAmount(option, option.checked);
    this.updateNextButtonState();
  }


  onProceed() {
    this.dialogRef.close('proceed');
  }

  onClose() {
    this.dialogRef.close('close');
  }

  goToNextStep() {
    this.nextClicked.emit();
    this.dialogRef.close('proceed');
  }
}
