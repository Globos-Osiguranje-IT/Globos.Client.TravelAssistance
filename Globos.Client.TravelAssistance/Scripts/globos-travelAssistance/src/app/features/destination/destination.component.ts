import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GbsAutocompleteComponent } from 'ng-globos-core';
import { Destination } from './models/destination';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { CodebookClientService } from '../../http/codebook-client.service';
import { DestinationTeritorialCoverage } from './models/destination-teritorial-coverage';
import { ItemChangeEvent } from './models/item-change-event';
import { TranslatePipe } from 'ng-globos-core';
import { AllValidationsDirective } from '../../validations/client-validation/allValidations';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'gbs-destination',
  standalone: true,
  imports: [GbsAutocompleteComponent, CommonModule, FormsModule, TranslatePipe, AllValidationsDirective],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss'
})
export class DestinationComponent implements OnInit {


  @Input() territorialCoverageId: number | null = null;
  @Input() selectedDestinationId: number | null = null;
  @Output() destinationChange = new EventEmitter<Destination>();

  destinationItems: Destination[] = [];
  selectedDestination: Destination | null = null;
  destinationTeritorialCoverage: DestinationTeritorialCoverage[] = [];

  constructor(
    private cashedCodeBookService: CashedCodebookClientService,
    private codeBookService: CodebookClientService
  ) {}
 
  ngOnInit(): void {
    const selectedDestinationStr = sessionStorage.getItem('selectedDestination');
    let destinationSession: Destination | null = null;

    if (selectedDestinationStr) {
      destinationSession = JSON.parse(selectedDestinationStr);
      this.selectedDestination = destinationSession;
      this.selectedDestinationId = destinationSession ? parseInt(destinationSession.value, 10) : null;

    }

    this.codeBookService.getDestinationTerritorialCoverage().subscribe(coverageRes => {
      this.destinationTeritorialCoverage = coverageRes;

      this.cashedCodeBookService.getDestination().subscribe(destinations => {
        let filteredCoverage: DestinationTeritorialCoverage[] = [];

        if (this.territorialCoverageId === 1) {
          filteredCoverage = this.destinationTeritorialCoverage;
        } else if (this.territorialCoverageId === 2) {
          filteredCoverage = this.destinationTeritorialCoverage.filter(dest => dest.territorialCoverageId === 1);

          const isInFilteredList = filteredCoverage.some(
            dc => dc.destinationId.toString() === destinationSession?.value
          );

          if (!isInFilteredList) {
            this.selectedDestination = null;
            this.selectedDestinationId = null;
            sessionStorage.removeItem('selectedDestination');
          }
        }

        this.destinationItems = filteredCoverage.map(dest => {
          const d = destinations.find((dd: any) => dd.id === dest.destinationId);
          return {
            label: d?.name ?? '',
            value: dest.destinationId.toString()
          };
        }).sort((a, b) => a.label.localeCompare(b.label));

      });
    });
  }

  onDestinationSelectionChange(event: ItemChangeEvent): void {
    const selected = this.destinationItems.find(d => d.value === event.value) || null;

    sessionStorage.removeItem('selectedDestination');
    if (selected) {
      sessionStorage.setItem('selectedDestination', JSON.stringify(selected));
    }

    // console.log("destinationChange",selected)

    this.selectedDestination = selected;

    if (selected) {
      this.destinationChange.emit(selected);
    }else{
      this.destinationChange.emit({ label: '', value: '0' });
    }
  }
}
