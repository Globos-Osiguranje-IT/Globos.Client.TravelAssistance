import { Component, EventEmitter, Input, output, Output, signal, Renderer2, ElementRef, SimpleChanges } from '@angular/core';
import { CodebookClientService } from '../../http/codebook-client.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GbsCheckboxComponent } from 'ng-globos-core';
import { InsuranceAdditionalCoverageResponse } from '../../http/dto/responses/codebook-response.model';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';
import { ArrangementPrice } from '../../enums';
import { InsuranceAdditionalCoverageEnum, InsuranceCoverageLevel } from '../../enums';
import { GbsInputComponent } from "../../../../../../../../globos-client-core/projects/ng-globos-core/src/lib/components/gbs-input/gbs-input.component";
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'gbs-additional-coverage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GbsCheckboxComponent, GbsInputComponent],

  templateUrl: './gbs-additional-coverage.component.html',
  styleUrls: ['./gbs-additional-coverage.component.scss']
})
export class GbsAdditionalCoverageComponent {

  @Output() selectionChanged = new EventEmitter<InsuranceAdditionalCoverageResponse[]>();
  @Output() arrangementPriceChanged = new EventEmitter<number>();
  @Output() premiumOnlyStateChanged = new EventEmitter<boolean>();

  //Vrerovatno bi trebalo da postoje ovi inputi, zbog edita sa druga strane, tako da mogu da se posalju cekirani checkboxovi i ukoliko je chekirana
  //opcija otkaz putovannja da se prikaze i iznos aranzmana
  @Input() selectedAdditionalCoverages: number[] = [];
  @Input() arrangementPrice?: string;
  @Input() canShowCancelTravelCheckbox: boolean = false;
  @Input() canShowWorkVisa: boolean=false;
  @Input() isFamilySelected: boolean = false;
  @Input() selectedTab: any;
  @Input() secondColumnList: any[] = [];


  insuranceCoverageLevelEnum = InsuranceCoverageLevel;
  insuranceEnum = InsuranceAdditionalCoverageEnum;

  checkboxes = signal<InsuranceAdditionalCoverageResponse[]>([]);
  firstColumn = signal<InsuranceAdditionalCoverageResponse[]>([]);
  secondColumn = signal<InsuranceAdditionalCoverageResponse[]>([]);
  half = 0;

  isPremiumOnlySelected = false;

  arrangementPriceShow: boolean = false;

  constructor(private cashedSession: CashedCodebookClientService, private renderer: Renderer2,
    private el: ElementRef, private cdr: ChangeDetectorRef) { }



  ngOnInit() {
    this.fetchCheckboxData();

    if (this.selectedAdditionalCoverages.includes(InsuranceAdditionalCoverageEnum.OTKAZ_PUTOVANJA)) {
      this.arrangementPriceShow = true;
    }
  }

  private fetchCheckboxData(): void {
    this.cashedSession.getInsurenceAdditionalCoverage().subscribe({
      next: res => {
        const filtered = res.filter((item: InsuranceAdditionalCoverageResponse) => item.isSurcharger !== false);
        filtered.forEach((item: InsuranceAdditionalCoverageResponse) => item.checked = this.selectedAdditionalCoverages.includes(item.id));
        this.checkboxes.set(filtered);
        this.half = Math.ceil(filtered.length / 2);
        this.firstColumn.set(filtered.slice(0, this.half));
        this.secondColumn.set(filtered.slice(this.half));
      },
      error: err => console.error(err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTab']) {
      const hospitalStayCheckboxIndex = this.secondColumnList.findIndex(c => c.id === 6);

      if (this.selectedTab?.id !== this.insuranceCoverageLevelEnum.PREMIUM) {
        if (hospitalStayCheckboxIndex !== -1 && this.secondColumnList[hospitalStayCheckboxIndex].checked) {
          this.secondColumnList[hospitalStayCheckboxIndex] = {
            ...this.secondColumnList[hospitalStayCheckboxIndex],
            checked: false
          };
          this.checkboxes.update(list =>
            list.map(c => c.id === 6 ? { ...c, checked: false } : c)
          );
          this.selectedAdditionalCoverages = this.selectedAdditionalCoverages.filter(id => id !== 6);
          this.selectionChanged.emit(this.checkboxes().filter(c => c.checked));
        }
        this.isPremiumOnlySelected = false;
        this.premiumOnlyStateChanged.emit(false);
      } else {

        if (hospitalStayCheckboxIndex !== -1) {
          const isChecked = hospitalStayCheckboxIndex !== -1 && this.secondColumnList[hospitalStayCheckboxIndex].checked;
          this.isPremiumOnlySelected = isChecked;
          this.premiumOnlyStateChanged.emit(isChecked);
        }
      }
      this.fetchCheckboxData();
    }


    if (changes['canShowCancelTravelCheckbox'] && !changes['canShowCancelTravelCheckbox'].currentValue) {
      const CANCEL_ID = this.insuranceEnum.OTKAZ_PUTOVANJA;
      const wasChecked = this.checkboxes().some(c => c.id === CANCEL_ID && c.checked);
      if (wasChecked) {
        // odčekiraj u signalima
        this.checkboxes.update(list =>
          list.map(c => c.id === CANCEL_ID ? { ...c, checked: false } : c)
        );
        // ukloni iz selectedAdditionalCoverages
        this.selectedAdditionalCoverages = this.selectedAdditionalCoverages.filter(id => id !== CANCEL_ID);
        // emit-uj novu selekciju
        this.selectionChanged.emit(this.checkboxes().filter(c => c.checked));
        // reset cena aranžmana
        this.arrangementPriceChanged.emit(0);
        this.renderer.setProperty(
          this.el.nativeElement.getElementById('arrangementPrice'),
          'value',
          ''
        );
      }
    }
  }


  secondColumnn(): any[] {
    return this.secondColumnList;
  }

  onCheckboxChange(item: InsuranceAdditionalCoverageResponse, event: any) {
    const CANCEL_ID = this.insuranceEnum.OTKAZ_PUTOVANJA;
    const PREMIUM_ID = this.insuranceEnum.PREMIUMPLUS;

    // Premium checkbox
    if (item.id === PREMIUM_ID) {
      const current = this.checkboxes().find(c => c.id === PREMIUM_ID);
      const next = !(current?.checked ?? false);
      this.isPremiumOnlySelected = next;
      this.premiumOnlyStateChanged.emit(next);
    }

    // update signal
    this.checkboxes.update(list =>
      list.map(c =>
        c.id === item.id ? { ...c, checked: !c.checked } : c
      )
    );

    // Always recalculate selectedAdditionalCoverages from the signal!
    this.selectedAdditionalCoverages = this.checkboxes()
      .filter(c => c.checked)
      .map(c => c.id);

    // ako se odčekiralo Otkaz putovanja, reset cena
    if (item.id === CANCEL_ID && event) {
      this.arrangementPrice = "";
      this.arrangementPriceChanged.emit(0);
    }

    // emit selekcije
    this.selectionChanged.emit(this.checkboxes().filter(c => c.checked));
  }
  
  onArrangementPriceChange(event: any) {
    const inputValue = Number(event.value);
    const valid = Math.min(inputValue, this.arrangementLimit);
    this.arrangementPrice = valid.toString();
    this.arrangementPriceChanged.emit(valid);

    // this.arrangementPrice = valid.toString();

    if (this.isFamilySelected) {
      if (inputValue > 600000) {
        this.arrangementPrice = ''; // Resetuj prvo
        setTimeout(() => this.arrangementPrice = '600000');
      }
    }
    else {
      if (inputValue > 350000) {
        this.arrangementPrice = ''; // Resetuj prvo
        setTimeout(() => this.arrangementPrice = '350000');
      }
    }

    const inp = this.el.nativeElement.querySelector('input');
    if (inp) this.renderer.setProperty(inp, 'value', this.arrangementPrice);


    //const inp = this.el.nativeElement.querySelector('input');
    //if (inp) this.renderer.setProperty(inp, 'value', this.arrangementPrice);
  }

  get arrangementLimit(): number {
    return this.isFamilySelected
      ? ArrangementPrice.PORODICNO
      : ArrangementPrice.INDIVIDUALNO;
  }

  /** Da li da prikažemo input cenu aranžmana? **/
  get showArrangementInput(): boolean {
    const CANCEL_ID = this.insuranceEnum.OTKAZ_PUTOVANJA;
    return this.canShowCancelTravelCheckbox &&
      this.checkboxes().some(c => c.id === CANCEL_ID && c.checked);
  }
}
