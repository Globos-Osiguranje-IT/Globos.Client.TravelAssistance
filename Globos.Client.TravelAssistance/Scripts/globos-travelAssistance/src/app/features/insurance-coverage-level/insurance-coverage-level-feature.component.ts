import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InusranceCoverageLevelResponse } from '../../http/dto/responses/codebook-response.model';
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
  @Input() selectedTab: InusranceCoverageLevelResponse | null = null;
  @Input() tabs: InusranceCoverageLevelResponse[] = [];
  @Input() isPremiumOnlySelected = false;

  @Output() selectedTabChange = new EventEmitter<InusranceCoverageLevelResponse>();

  constructor(private codeBookService: CodebookClientService) {}

  ngOnInit(): void {
    this.selectedTab && this.selectedTabChange.emit(this.selectedTab);

    this.codeBookService.getTerritorialCoverage().subscribe(res => {
      localStorage.setItem('territorialCoverage', JSON.stringify(res));
    });
  }

  changeTab(tab: InusranceCoverageLevelResponse): void {
    if (this.selectedTab?.id === tab.id || (tab.name === 'STANDARD' && this.isPremiumOnlySelected)) return;
    this.selectedTabChange.emit(tab);
  }

  trackById(_: number, item: InusranceCoverageLevelResponse): number {
    return item.id;
  }
}
