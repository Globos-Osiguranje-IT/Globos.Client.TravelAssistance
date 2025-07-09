import { Component, Input } from '@angular/core';
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

export class TravelInfoPageComponent{
  Large = ButtonSize.Large;
  Type = ButtonType.Positive;

  tabs: InusranceCoverageLevelResponse[] = [];
  selectedCoverageCard: any = {};
  
  @Input() selectedTab: InusranceCoverageLevelResponse | null = null;

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
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loader.show();
    this.cashedService.getCoverageLevels().subscribe({
      next: (res) => {
        if (res?.length) {
          res.pop();
          this.tabs = res;
          this.selectedTab ||= this.tabs.find(x => x.id === 1) || null;
          this.loader.hide();
        }
      },
      error: () => this.loader.hide(),
    });
  }

  onselectedTabChange(event: InusranceCoverageLevelResponse) {
    console.log(event, 'sta je event')
    this.selectedTab = event;

    this.policyClientService.policyInfoOfferRequest.coverrageLevelId = event.id;
    this.policyClientService.policyInfoOfferRequest.insurancePurchaseDate = new Date().toJSON().slice(0, 10);

    localStorage.setItem('step1RequestObject', JSON.stringify(this.policyClientService.policyInfoOfferRequest));
  }

  onNextButtonClicked() {
    this.router.navigate(['putno-osiguranje', 'info'])
  }

  getInfoOffer() {
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

        this.policyClientService.infooffers = [];

        this.policyClientService.infooffers = result.map((item) => ({
          ...item,
          osiguranaSuma: osiguranaSumaHelper.find((os) => os.id === item.insuranceSumId)?.amount ?? 0,
          territorialName: teritorijaHelper.find((t) => t.id === item.territorialCoverageId)?.name ?? '',
        }));

        localStorage.setItem('infoOffers', JSON.stringify(this.policyClientService.infooffers));
      } else {
        this.loader.hide();
      }
    });
  }

  openAsistencijaDialog() {
    const dialogRef = this.dialog.open(InfoPonudaComponent, {
      width: '80vw',
      maxWidth: 'none',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
    });
  }
}
