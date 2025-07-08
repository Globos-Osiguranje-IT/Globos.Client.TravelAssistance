import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PolicyInfoOfferPrikaz } from './model/plansModel.model';
import { InusranceCoverageLevelResponse } from '../../http/dto/responses/codebook-response.model';
import { CodebookClientService } from '../../http/codebook-client.service';
import { PolicyClientService } from '../../http/policy-client.service';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';

@Component({
  selector: 'gbs-insurance-coverage-level-feature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './insurance-coverage-level-feature.component.html',
  styleUrl: './insurance-coverage-level-feature.component.scss',
})
export class InsuranceCoverageLevelFeatureComponent {
  @Input() showCoverageError: boolean = false;
  @Input() showInfoMessage: boolean = false;
  @Input() showInfoMessageAnnual: boolean = false;

  @Input() selectedTab: InusranceCoverageLevelResponse | null = null;

  @Input() card?: PolicyInfoOfferPrikaz;
  @Input() cards: PolicyInfoOfferPrikaz[] = [];
  @Input() tabs: InusranceCoverageLevelResponse[] = [];
  @Input() selectedCard: any = undefined;

  @Input() isPremiumOnlySelected?: boolean;

  @Output() selectedTabChange = new EventEmitter<InusranceCoverageLevelResponse>();
  @Output() selectedCardChange = new EventEmitter<any>();

  constructor(
    public policyClientService: PolicyClientService,
    private codeBookService: CodebookClientService,
    private cashedService: CashedCodebookClientService
  ) {}

  ngOnInit() {
    if (this.selectedTab) this.changeTab(this.selectedTab);

    this.codeBookService.getTerritorialCoverage().subscribe((resTeritorial) => {
      localStorage.setItem('territorialCoverage', JSON.stringify(resTeritorial));
    });

    this.cashedService.getInsuredSum().subscribe({
      next: (res) => {},
      error: (err) => {},
    });
  }

  changeTab(tab: InusranceCoverageLevelResponse) {
    if (tab.name === 'PLUS' && this.isPremiumOnlySelected) {
      return;
    }

    this.selectedTabChange.emit(tab);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cards'] && Array.isArray(changes['cards'].currentValue)) {
      if ((changes['cards'].currentValue as any[]).length === 0) {
        this.onSelectedCardChange(undefined as any);
      }
    }
    if (changes['card'] && !changes['card'].currentValue) {
      this.onSelectedCardChange(undefined as any);
    }
  }

  onSelectedCardChange(card: PolicyInfoOfferPrikaz) {
    this.selectedCard = card;
    this.selectedCardChange.emit(card);
    localStorage.removeItem('selectedOffer');
    localStorage.setItem('selectedOffer', JSON.stringify(card));
  }
}
