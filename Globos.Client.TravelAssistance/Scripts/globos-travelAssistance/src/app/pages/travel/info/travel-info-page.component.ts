import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsuranceCoverageLevelFeatureComponent } from '../../../features/insurance-coverage-level/insurance-coverage-level-feature.component';
import { InusranceCoverageLevelResponse } from '../../../http/dto/responses/codebook-response.model';
import { LoaderService } from '../../../services/loader.service';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';
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
    InfoPonudaComponent,
  ],
  templateUrl: './travel-info-page.component.html',
  styleUrl: './travel-info-page.component.scss',
})

export class TravelInfoPageComponent{
  Large = ButtonSize.Large;
  Type = ButtonType.Positive;

  tabs: InusranceCoverageLevelResponse[] = [];
  selectedCoverageCard: any = {};

  showInfoModal = false;
  
  @Input() selectedTab?: InusranceCoverageLevelResponse;

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
    private cashedService: CashedCodebookClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loader.show();

    this.cashedService.getCoverageLevels().subscribe({
      next: (res) => {
        this.loader.hide();

        if (res?.length) {
          this.tabs = res;

          const savedTabId = localStorage.getItem('selectedTab');
          const matchedTab = this.tabs.find(tab => tab.id === Number(savedTabId));

          this.selectedTab = matchedTab || this.tabs.find(x => x.id === 1);
        }
      },
      error: () => {
        this.loader.hide();
      },
    });
  }

  onselectedTabChange(event: InusranceCoverageLevelResponse) {
    this.selectedTab = event;
    localStorage.setItem('selectedTab', event.id.toString())
  }

  onNextButtonClicked() {
    this.router.navigate(['putno-osiguranje', 'passanger'])
  }

  openInfoModal() {
    this.showInfoModal = true;
  }

  closeInfoModal() {
    this.showInfoModal = false;
  }
}
