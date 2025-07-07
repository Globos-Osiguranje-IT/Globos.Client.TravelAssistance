import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GbsCheckboxComponent } from 'ng-globos-core';
import { CommonModule } from '@angular/common';
import { ConsentItem, Consent } from './model/consent-item.model';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';

@Component({
  selector: 'gbs-consent-feature',
  standalone: true,
  imports: [GbsCheckboxComponent, CommonModule],
  templateUrl: './consent-feature.component.html',
  styleUrls: ['./consent-feature.component.scss']
})

export class ConsentFeatureComponent implements OnInit {

  @Output() consentChanged = new EventEmitter<Consent[]>();
  @Input() forceShowAlert: boolean = false;
  @Input() selectedConsents: number[] = [];


  checkboxStates = new Map<string, boolean>();
  consentItems: ConsentItem[] = [];

  constructor(private cashedSessionService: CashedCodebookClientService) { }

  allSelect: ConsentItem = {
    id: '-100',
    name: 'Izaberi sve',
    documentPath: '',
    isMandatory: false,
    isValid: true,
    checked: false
  }

  ngOnInit(): void {
    this.cashedSessionService.getConsent().subscribe({
      next: (consents) => {
        this.consentItems = consents;
        const validConsents = consents.filter((consent: any) => consent.isValid);
        this.consentItems = [this.allSelect, ...validConsents]; 

        const savedConsents = sessionStorage.getItem('selectedConsents');
        if (savedConsents) {
          this.selectedConsents = JSON.parse(savedConsents);
        }

        this.consentItems.forEach((item: ConsentItem) => {
          item.checked = this.selectedConsents.includes(Number(item.id));
        });

        if (this.selectedConsents.length > 0) {
          if (this.selectedConsents.length === 5) {
            this.consentItems
              .filter(item => item.id !== '-100')
              .forEach(item => this.checkboxStates.set(item.id, this.selectedConsents.includes(Number(item.id))))

            this.consentItems.filter(item => item.id === '-100').forEach(item => this.checkboxStates.set(item.id, true))

            const selected = this.consentItems
              .filter(item => item.id !== '-100' && this.checkboxStates.get(item.id))
              .map(item => Number(item.id));

              this.selectedConsents = selected;

              this.emitCurrentState();
          }
          else {
            this.consentItems
              .filter(item => item.id !== '-100')
              .forEach(item => this.checkboxStates.set(item.id, this.selectedConsents.includes(Number(item.id))))

              const selected = this.consentItems
              .filter(item => item.id !== '-100' && this.checkboxStates.get(item.id))
              .map(item => Number(item.id));

              this.selectedConsents = selected;

              this.emitCurrentState();
          }
        }
      },
      error: (error) => console.error("Erorr: ", error)
    })
  }

  private saveToSession(): void {
    sessionStorage.setItem('selectedConsents', JSON.stringify(this.selectedConsents));
  }

  onCheckboxChange(id: string, checked: any): void {
    // console.log("STA JE CHECKED (EVENT)??? ", checked)
    const isChecked = checked?.selected ?? checked === true;
    this.checkboxStates.set(id, isChecked);


    if (id === '-100') {
      this.consentItems
        .filter(item => item.id !== '-100')
        .forEach(item => this.checkboxStates.set(item.id, isChecked));
    } else {
      const allIndividuallyChecked = this.consentItems
        .filter(item => item.id !== '-100')
        .every(item => this.checkboxStates.get(item.id) === true);
  
      this.checkboxStates.set('-100', allIndividuallyChecked);
    }

    const selected = this.consentItems
      .filter(item => item.id !== '-100' && this.checkboxStates.get(item.id))
      .map(item => Number(item.id));

    this.selectedConsents = selected;

    this.emitCurrentState();
    this.saveToSession();
  }


  private emitCurrentState(): void {
    const updatedList = Array.from(this.checkboxStates.entries())
      .filter(([id, checked]) => checked === true && id !== '-100')
      .map(([id, checked]) => ({ id, checked }));

    this.consentChanged.emit(updatedList);
  }

  public isConsentValid(): boolean {
    return this.consentItems
      .filter(item => item.isMandatory)
      .every(item => this.checkboxStates.get(item.id) === true);
  }



  private areAllRequiredChecked(): boolean {
    return this.consentItems
      .filter(item => item.isMandatory)
      .every(item => this.checkboxStates.get(item.id) === true);
  }

  get showAlert(): boolean {
    return !this.areAllRequiredChecked();
  }

  openLink(event: MouseEvent, link: string) {
    event.preventDefault();
    event.stopPropagation();
    if (link) {
      window.open(link, '_blank');
    }
  }

  isFieldInvalid(item: ConsentItem): boolean {
    return item.isMandatory && this.forceShowAlert && !this.checkboxStates.get(item.id);
  }

}