import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfoOfferResponse, InusranceCoverageLevelResponse } from '../../http/dto/responses/codebook-response.model';
import { CodebookClientService } from '../../http/codebook-client.service';

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
  @Input() selectedTab: InfoOfferResponse | null = null;
  @Input() tabs: InfoOfferResponse[] = [];
  @Input() isPremiumOnlySelected = false;

  @Output() selectedTabChange = new EventEmitter<InfoOfferResponse>();

  constructor(private codeBookService: CodebookClientService) {}

  ngOnInit(): void {
    this.selectedTab && this.selectedTabChange.emit(this.selectedTab);

    this.codeBookService.getTerritorialCoverage().subscribe(res => {
      localStorage.setItem('territorialCoverage', JSON.stringify(res));
    });
  }

  changeTab(tab: InfoOfferResponse): void {
    if (this.selectedTab?.coverrageLevelId === tab.coverrageLevelId || (tab.coverrageLevelName === 'STANDARD' && this.isPremiumOnlySelected)) return;
    this.selectedTabChange.emit(tab);
  }

  trackById(_: number, item: InfoOfferResponse): number {
    return item.coverrageLevelId;
  }
}
