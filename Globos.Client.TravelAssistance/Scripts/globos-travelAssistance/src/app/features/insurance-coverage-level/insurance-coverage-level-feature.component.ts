import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsuranceCovaregeTypeComponent } from '../../components/insurance-coverage-type/insurance-covarege-type.component';
import { InfoPonudaComponent } from '../../components/info-ponuda/info-ponuda.component';
import { MatDialog } from '@angular/material/dialog';
import { Plan, PolicyInfoOfferPrikaz, PolicyInfoOfferResponse } from './model/plansModel.model';
import { InsuredSumResponse, InusranceCoverageLevelResponse, TerritorialCoverageResponse } from '../../http/dto/responses/codebook-response.model';
import { CodebookClientService } from '../../http/codebook-client.service';
import { LoaderService } from '../../services/loader.service';
import { PolicyClientService } from '../../http/policy-client.service';
import { CashedCodebookClientService } from '../../http/cashed-codebook-client.service';

// export type CoverageLevelTabs = 'standard' | 'premium' | '';

@Component({
  selector: 'gbs-insurance-coverage-level-feature',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InsuranceCovaregeTypeComponent],
  templateUrl: './insurance-coverage-level-feature.component.html',
  styleUrl: './insurance-coverage-level-feature.component.scss'
})

export class InsuranceCoverageLevelFeatureComponent {


  // infooffers: PolicyInfoOfferPrikaz[] = [];
  @Input() showCoverageError: boolean = false;
  @Input() showInfoMessage:boolean=false;
  @Input() showInfoMessageAnnual:boolean=false;

  @Input() selectedTab: InusranceCoverageLevelResponse | null = null;

  @Input() card?: PolicyInfoOfferPrikaz;
  @Input() cards: PolicyInfoOfferPrikaz[] = [];
  @Input() tabs: InusranceCoverageLevelResponse[] = [];
  @Input() selectedCard: any = undefined;

  @Input() isPremiumOnlySelected?: boolean;


  @Output() selectedTabChange = new EventEmitter<InusranceCoverageLevelResponse>();
  osiguranaSuma: number = 0;
  @Output() selectedCardChange = new EventEmitter<any>();


  constructor(private dialog: MatDialog, public policyClientService: PolicyClientService, private loader: LoaderService, private codeBookService: CodebookClientService, private cashedService: CashedCodebookClientService
  ) {}

  ngOnInit() {
    // console.log("THIS CARD FROM INIT InsuranceCoverageLevelFeatureComponent: ", this.card)

    // console.log(this.selectedTab)
      if(this.selectedTab)
        this.changeTab(this.selectedTab);

      // this.infooffers = this.policyClientService.infooffers;      

      this.codeBookService.getTerritorialCoverage().subscribe(resTeritorial => {
        sessionStorage.setItem('territorialCoverage', JSON.stringify(resTeritorial));
      })

      this.cashedService.getInsuredSum().subscribe({
        next: res => {
        },
        error: err => {
          // console.log("Error in getting insured sum: ", err)
        }
      })

      
  }

  changeTab(tab: InusranceCoverageLevelResponse) {

    // console.log(this.selectedTab)
    if (tab.name === 'STANDARD' && this.isPremiumOnlySelected) {
      return; // Sprečava i fallback klik
    }

    // this.selectedTab = tab;
    

    this.selectedTabChange.emit(tab);

    //this.policyClientService.postInfooffer().subscribe( result=>{
    //  // console.log("STA JE RESULT: ", result)
    //  if(result){
    //    this.loader.hide();

    //    let teritorijaHelper: TerritorialCoverageResponse[] = JSON.parse(sessionStorage.getItem('territorialCoverage') || '{}');
    //    let osiguranaSumaHelper: InsuredSumResponse[] = JSON.parse(sessionStorage.getItem('insuredSum') || '{}');
        
    //    this.infooffers = [];

    //   result.sort((a, b) => a.finalAmount - b.finalAmount);
    //    result.forEach(item=>{
    //      this.infooffers.push({
    //        additionalCoverages: item.additionalCoverages,
    //        additionalInsuranceAmount: item.additionalInsuranceAmount,
    //        additionalInsuranceTax: item.additionalInsuranceTax,
    //        amount: item.amount,
    //        coverageLevelId: item.coverageLevelId,
    //        discount: item.discount,
    //        discountId: item.discountId,
    //        finalAmount: item.finalAmount,
    //        insuranceSumId: item.insuranceSumId,
    //        osiguranaSuma: osiguranaSumaHelper.find(os => os.id === item.insuranceSumId)!.amount,
    //        tariffId: item.tariffId,
    //        tax: item.tax,
    //        territorialCoverageId: item.territorialCoverageId,
    //        territorialName: teritorijaHelper.filter(t => t.id === item.territorialCoverageId)[0].name
    //      })
    //    })
    //  }
    //  else{
    //    this.loader.hide();
    //  }
    //})
    // this.policyClientService.postInfooffer().subscribe( result=>{
    //   // console.log("STA JE RESULT: ", result)
    //   if(result){
    //     this.loader.hide();
    //     let teritorijaHelper: TerritorialCoverageResponse[] = JSON.parse(sessionStorage.getItem('territorialCoverage') || '{}');
    //     this.infooffers = [];
    //     result.forEach(item=>{
    //       this.infooffers.push({
    //         additionalCoverages: item.additionalCoverages,
    //         additionalInsuranceAmount: item.additionalInsuranceAmount,
    //         additionalInsuranceTax: item.additionalInsuranceTax,
    //         amount: item.amount,
    //         coverageLevelId: item.coverageLevelId,
    //         discount: item.discount,
    //         discountId: item.discountId,
    //         finalAmount: item.finalAmount,
    //         insuranceSumId: item.insuranceSumId,
    //         tariffId: item.tariffId,
    //         tax: item.tax,
    //         territorialCoverageId: item.territorialCoverageId,
    //         territorialName: teritorijaHelper.filter(t => t.id === item.territorialCoverageId)[0].name
    //       })
    //     })
    //   }
    //   else{
    //     this.loader.hide();
    //   }
    // })
    
  }
  ngOnChanges(changes: SimpleChanges) {
    // kad parent prosledi prazan niz, deselectuj
    if (changes['cards'] && Array.isArray(changes['cards'].currentValue)) {
      if ((changes['cards'].currentValue as any[]).length === 0) {
        this.onSelectedCardChange(undefined as any);
      }
    }
    // kad parent prosledi card = undefined, deselectuj
    if (changes['card'] && !changes['card'].currentValue) {
      this.onSelectedCardChange(undefined as any);
    }
  }
  
  openAsistencijaDialog() {
    const dialogRef = this.dialog.open(InfoPonudaComponent, {
      width: '80vw',
      maxWidth: 'none',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container'
    });


    dialogRef.afterClosed().subscribe(result => {

    });
  }

  onSelectedCardChange(card: PolicyInfoOfferPrikaz) {
    // console.log("What is card: ", card);
    this.selectedCard = card;
    this.selectedCardChange.emit(card);
    sessionStorage.removeItem('selectedOffer');
    sessionStorage.setItem('selectedOffer',  JSON.stringify(card));
  }
}
