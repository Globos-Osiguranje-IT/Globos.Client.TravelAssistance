import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslatePipe } from 'ng-globos-core'
import { CodebookResponse } from '../../http/dto/responses/codebook-response.model';
import { CodebookClientService } from '../../http/codebook-client.service';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';

@Component({
  selector: 'gbs-insurance-category-feature',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './insurance-category-feature.component.html',
  styleUrl: './insurance-category-feature.component.scss'
})
export class InsuranceCategoryFeatureComponent implements OnInit {
  categories: CodebookResponse[] = [];


  @Input() insuranceTypeId!: number;
  @Input() insuranceType?: CodebookResponse;
  @Output() categorySelected = new EventEmitter<CodebookResponse>();


  constructor(private codeBookService: CodebookClientService, private cashedSessionService: CashedCodebookClientService) { }

  ngOnInit(): void {

    this.cashedSessionService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;

        if (this.insuranceType) {
          this.categorySelected.emit(this.insuranceType);
        }
      },
      error: (error) => console.error("Erorr: ", error)
    })
  }

  setInsuranceType(category: CodebookResponse): void {
    this.insuranceType = category;
    this.categorySelected.emit(category);
  }
}
