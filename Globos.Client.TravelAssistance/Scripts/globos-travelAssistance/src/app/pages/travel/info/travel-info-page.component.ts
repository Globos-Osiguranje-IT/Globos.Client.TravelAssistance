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

        const raw = sessionStorage.getItem('selectedTab');
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
        sessionStorage.setItem('selectedTab', JSON.stringify(defaultTab));
      },
      error: () => this.loader.hide(),
    });
  }

  onselectedTabChange(event: InfoOfferResponse) {
    this.selectedTab = event;
    sessionStorage.setItem('selectedTab', JSON.stringify(event));
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
