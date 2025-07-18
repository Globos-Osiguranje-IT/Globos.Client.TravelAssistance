import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsuranceCoverageLevelFeatureComponent } from '../../../features/insurance-coverage-level/insurance-coverage-level-feature.component';
import { InfoOfferResponse } from '../../../http/dto/responses/codebook-response.model';
import { LoaderService } from '../../../services/loader.service';
import { ButtonSize, ButtonType, GbsButtonComponent } from 'ng-globos-core';
import { InfoPonudaComponent } from '../../../components/info-ponuda/info-ponuda.component';
import { Router } from '@angular/router';
import { PolicyClientService } from '../../../http/policy-client.service';

@Component({
  selector: 'app-travel-info-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InsuranceCoverageLevelFeatureComponent,
    GbsButtonComponent,
    InfoPonudaComponent,
  ],
  templateUrl: './travel-info-page.component.html',
  styleUrl: './travel-info-page.component.scss',
})
export class TravelInfoPageComponent {
  Large = ButtonSize.Large;
  Type = ButtonType.Positive;

  tabs: InfoOfferResponse[] = [];
  selectedCoverageCard: any = {};
  planName: string[] = [];
  planAmount: number[] = [];

  showInfoModal = false;

  @Input() selectedTab?: InfoOfferResponse;

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
    private policyService: PolicyClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loader.show();

    this.policyService.Infooffer().subscribe({
      next: (offers: any[]) => {
        this.loader.hide();
        this.tabs = offers;
        this.planName = offers.map((o) => o.coverrageLevelName);
        this.planAmount = offers.map((o) => o.finalAmount);

        const raw = localStorage.getItem('selectedTab');
        let defaultTab: InfoOfferResponse;
        if (raw) {
          try {
            const saved = JSON.parse(raw) as InfoOfferResponse;
            defaultTab =
              this.tabs.find(
                (t) => t.coverrageLevelId === saved.coverrageLevelId
              ) ?? this.tabs[0];
          } catch {
            defaultTab = this.tabs[0];
          }
        } else {
          defaultTab = this.tabs[0];
        }

        this.selectedTab = defaultTab;
        localStorage.setItem('selectedTab', JSON.stringify(defaultTab));
      },
      error: () => this.loader.hide(),
    });
  }

  onselectedTabChange(event: InfoOfferResponse) {
    this.selectedTab = event;
    localStorage.setItem('selectedTab', JSON.stringify(event));
  }

  onNextButtonClicked() {
    this.router.navigate(['pomoc-na-putu', 'passanger']);
  }

  openInfoModal() {
    this.showInfoModal = true;
  }

  closeInfoModal() {
    this.showInfoModal = false;
  }
}
