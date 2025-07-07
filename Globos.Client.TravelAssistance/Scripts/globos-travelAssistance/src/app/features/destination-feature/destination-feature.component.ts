import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from 'ng-globos-core';
import { GbsDropdownComponent } from 'ng-globos-core';
import { Destination } from './model/destination-feature.model';
import { DropdownItem } from './model/dropdown-item.model';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { DropdownRequiredDirective } from '../../validations/client-validation/dropdown-required-directive';

@Component({
  selector: 'gbs-destination-feature',
  standalone: true,
  imports: [CommonModule, TranslatePipe, GbsDropdownComponent, DropdownRequiredDirective],
  templateUrl: './destination-feature.component.html',
  styleUrl: './destination-feature.component.scss'
})
export class DestinationFeatureComponent implements OnInit {
  

  @Input() selectedDestination: Destination | any = null;
  @Input() selectedDestinationId: number | null = null;
  @Output() destinationChange = new EventEmitter<Destination>();
  @ViewChild(DropdownRequiredDirective) private dropdownValidator!: DropdownRequiredDirective;

  destinations: Destination[] = [];
  destinationItems: DropdownItem[] = [];

  constructor(private cashedCodeBookService: CashedCodebookClientService) {}


  ngOnInit(): void {

   
    this.cashedCodeBookService.getDestination().subscribe((response) => {

      this.destinations = response.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
  
      this.destinationItems = this.destinations.map(dest => ({
        label: dest.name,
        value: dest.id.toString()
      }));
  
      this.destinationItems.unshift({
        label: '',   
        value: ''
      });
  
      if (this.selectedDestinationId !== null) {
        this.selectedDestination = this.destinations.find(
          dest => dest.id === this.selectedDestinationId
        ) || null;
      }
    });
  }
  


  public validate(): void {
    this.dropdownValidator.triggerValidation();
  }

  onDestinationChange(newValue: string): void {
    const selectedId = parseInt(newValue, 10);
    this.selectedDestination = this.destinations.find(dest => dest.id === selectedId) || null;

    sessionStorage.removeItem('selectedDestination');
    sessionStorage.setItem('selectedDestination', JSON.stringify(this.selectedDestination));
    
    if (this.selectedDestination) {
      this.destinationChange.emit(this.selectedDestination);
    }
  }
}
