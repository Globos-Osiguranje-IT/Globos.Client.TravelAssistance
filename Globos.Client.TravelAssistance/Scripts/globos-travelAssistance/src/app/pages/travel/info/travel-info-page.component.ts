import { ChangeDetectorRef, Component, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsuranceCoverageLevelFeatureComponent } from '../../../features/insurance-coverage-level/insurance-coverage-level-feature.component';
import { InsuredSumResponse, InusranceCoverageLevelResponse, TerritorialCoverageResponse } from '../../../http/dto/responses/codebook-response.model';
import { LoaderService } from '../../../services/loader.service';
import { PolicyClientService } from '../../../http/policy-client.service';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
import { PolicyInfoOfferPrikaz } from '../../../features/insurance-coverage-level/model/plansModel.model';
import { MatDialog } from '@angular/material/dialog';
import { ButtonSize, ButtonType, GbsButtonComponent } from 'ng-globos-core';
import { InfoPonudaComponent } from '../../../components/info-ponuda/info-ponuda.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-travel-info-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InsuranceCoverageLevelFeatureComponent,
    GbsButtonComponent,
  ],
  templateUrl: './travel-info-page.component.html',
  styleUrl: './travel-info-page.component.scss',
})
export class TravelInfoPageComponent implements AfterViewInit {
  Large = ButtonSize.Large;
  Type = ButtonType.Positive;

  isMobile = false;
  tabs: InusranceCoverageLevelResponse[] = [];
  loading: boolean = false;

  ////VALIDACIJA
  validationResult: boolean = true;

  selectedCoverageCard: any = {};
  showCoverageError: boolean = false;

  initialLoad: boolean = true;
  previouslySelectedCardIndex: number = 0;

  @Input() selectedTab?: InusranceCoverageLevelResponse;
  cards: PolicyInfoOfferPrikaz[] = [];
  selectedCard?: PolicyInfoOfferPrikaz;

  isPremiumOnlySelected?: boolean;

  nextButtonStyles = {
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'color': 'white',
    'font-weight': 'bold',
    'font-size': '18px',
    'text-align': 'center',
    'background-color': '#ff7f3f',
    'border-radius': '8px',
    'padding': '10px 32px',
    'min-width': '140px',
    'max-width': '160px',
    'height': '50px',
    'box-shadow': '0px 4px 6px rgba(0, 0, 0, 0.1)',
    'border': 'none',
    'cursor': 'pointer',
    'transition': 'transform 0.1s ease-in-out',
  };

  constructor(
    private loader: LoaderService,
    private policyClientService: PolicyClientService,
    private cashedService: CashedCodebookClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile.bind(this));

    this.cashedService.getCoverageLevels().subscribe({
      next: (res) => {
        console.log(res, 'sta je ovo')
        this.loader.show();

        if (res) {
          res.pop();
          this.tabs = res;
          this.loader.hide();
        }
      },
      error: (error) => {
        this.loader.hide();
      },
    });
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.resetValidations();
    });
  }

  onPremiumOnlyChange(value: boolean): void {
    this.isPremiumOnlySelected = value;
    localStorage.setItem('isPremiumOnlySelected', JSON.stringify(this.isPremiumOnlySelected));
    this.cdr.detectChanges();
  }

  onselectedTabChange(event: InusranceCoverageLevelResponse) {
    this.selectedTab = event;

    this.resetCoverageCard();

    this.policyClientService.policyInfoOfferRequest.coverrageLevelId = event.id;
    this.policyClientService.policyInfoOfferRequest.insurancePurchaseDate = new Date().toJSON().slice(0, 10);

    localStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));
  }

  onSelectedCardFromCoverage(card: any) {
    this.selectedCoverageCard = card;
    this.showCoverageError = false;

    if (card && this.cards.length > 0) {
      const index = this.cards.findIndex(
        (c) =>
          c.tariffId === card.tariffId &&
          c.territorialCoverageId === card.territorialCoverageId &&
          c.insuranceSumId === card.insuranceSumId
      );
      if (index !== -1) {
        this.previouslySelectedCardIndex = index;
      } else {
        this.previouslySelectedCardIndex = 0;
      }
    } else {
      this.previouslySelectedCardIndex = 0;
    }
  }

  onNextButtonClicked() {
    this.router.navigate(['putno-osiguranje', 'info'])
  }

  getInfoOffer() {
    if (this.validate()) {
      this.loader.show();

      this.policyClientService.postInfooffer().subscribe((result) => {
        // console.log("STA JE RESULT: ", result)
        if (result) {
          this.loader.hide();
          let teritorijaHelper: TerritorialCoverageResponse[] = JSON.parse(
            localStorage.getItem('territorialCoverage') || '{}'
          );
          let osiguranaSumaHelper: InsuredSumResponse[] = JSON.parse(
            localStorage.getItem('insuredSum') || '{}'
          );

          result.sort((a, b) => a.finalAmount - b.finalAmount);

          this.policyClientService.infooffers = [];
          // localStorage.removeItem('infoOffers');

          result.forEach((item) => {
            this.policyClientService.infooffers.push({
              additionalCoverages: item.additionalCoverages,
              additionalInsuranceAmount: item.additionalInsuranceAmount,
              additionalInsuranceTax: item.additionalInsuranceTax,
              amount: item.amount,
              coverageLevelId: item.coverageLevelId,
              discount: item.discount,
              travelInsuranceDiscount: item.travelInsuranceDiscount,
              travelInsuranceFinalAmount: item.travelInsuranceFinalAmount,
              discountId: item.discountId,
              discountNote: item.discountNote,
              finalAmount: item.finalAmount,
              insuranceSumId: item.insuranceSumId,
              osiguranaSuma: osiguranaSumaHelper.find((os) => os.id === item.insuranceSumId)!.amount,
              tariffId: item.tariffId,
              tariffGroupId: item.tariffGroupId,
              tariffSubgroupId: item.tariffSubgroupId,
              tax: item.tax,
              taxTravelInsuranceAfterDiscount:
                item.taxTravelInsuranceAfterDiscount,
              territorialCoverageId: item.territorialCoverageId,
              territorialName: teritorijaHelper.filter(
                (t) => t.id === item.territorialCoverageId
              )[0].name,
            });
          });

          localStorage.setItem('infoOffers', JSON.stringify(this.policyClientService.infooffers));
          this.cards = this.policyClientService.infooffers;

          this.setPreviouslySelectedCard();
        } else {
          this.loader.hide();
        }
      });
    }
  }

  private setPreviouslySelectedCard() {
    if (this.cards.length === 0) {
      this.previouslySelectedCardIndex = 0;
      return;
    }

    if (
      this.previouslySelectedCardIndex != null &&
      this.cards.length > this.previouslySelectedCardIndex
    ) {
      this.selectedCard = this.cards[this.previouslySelectedCardIndex];
    } else {
      this.selectedCard = this.cards[0];
      this.previouslySelectedCardIndex = 0;
    }

    localStorage.setItem('selectedOffer', JSON.stringify(this.selectedCard));
    this.onSelectedCardFromCoverage(this.selectedCard);
  }

  resetValidations() {
    this.showCoverageError = false;

    this.validationResult = true;
  }

  resetCoverageCard() {
    this.selectedCoverageCard = {};
    this.showCoverageError = false;
  }

  validateCoverageCard() {
    this.showCoverageError = !this.selectedCoverageCard || Object.keys(this.selectedCoverageCard).length === 0;
  }

  validate() {
    return true;
  }

  openAsistencijaDialog() {
    const dialogRef = this.dialog.open(InfoPonudaComponent, {
      width: '80vw',
      maxWidth: 'none',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}
