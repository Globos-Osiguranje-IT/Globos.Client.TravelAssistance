import { Component, EventEmitter, Input, LOCALE_ID, Output, SimpleChanges } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { InusranceCoverageLevelResponse } from '../../http/dto/responses/codebook-response.model';
import { PolicyInfoOfferPrikaz } from '../../features/insurance-coverage-level/model/plansModel.model';
import { InsurnaceTypeService } from '../../services/insurnace-type.service';
import localeSr from '@angular/common/locales/sr';

registerLocaleData(localeSr); // 🇷🇸 Register Serbian locale

@Component({
  selector: 'gbs-insurance-covarege-type',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  providers: [{ provide: LOCALE_ID, useValue: 'sr' }],
  templateUrl: './insurance-covarege-type.component.html',
  styleUrl: './insurance-covarege-type.component.scss'
})
export class InsuranceCovaregeTypeComponent {

  @Input() infooffers: PolicyInfoOfferPrikaz[] = [];
  @Input() selectedTab?: InusranceCoverageLevelResponse;
  // @Input() selectedCard: PolicyInfoOfferPrikaz | null = null;
  @Input() card?: PolicyInfoOfferPrikaz;
  @Input() cards: PolicyInfoOfferPrikaz[] = [];
  @Output() selectedCardChange = new EventEmitter<any>(); 

  selectedCard: any = null; 

  constructor(private service: InsurnaceTypeService){}

   ngOnInit() {
    if(this.card){
      this.selectCard(this.card);
    }
  }

  ngAfterViewInit() {
    if(this.card){
      this.selectCard(this.card);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const offersChanged = changes['infooffers'] && Array.isArray(changes['infooffers'].currentValue);
    const cardChanged   = changes['card'];
  
    // kad roditelj očisti ponude
    if (offersChanged && (changes['infooffers'].currentValue as any[]).length === 0) {
      this.selectedCard = null;
      this.selectedCardChange.emit(null);        // EMITUJ deselect
    }
  
    // kad roditelj pošalje card = undefined | null
    if (cardChanged && !changes['card'].currentValue) {
      this.selectedCard = null;
      this.selectedCardChange.emit(null);        // EMITUJ deselect
    }
  
    // kad roditelj daje novu kartu (npr. nakon getInfoOffer)
    if (cardChanged && changes['card'].currentValue) {
      this.selectCard(changes['card'].currentValue);
      // selectCard() će postaviti amount i emitovati novu selekciju
    }
  }
  

  selectCard(card: PolicyInfoOfferPrikaz) {
    this.selectedCard = card;
    this.service.setAmount(card.finalAmount);
    this.selectedCardChange.emit(card);
  }

}
