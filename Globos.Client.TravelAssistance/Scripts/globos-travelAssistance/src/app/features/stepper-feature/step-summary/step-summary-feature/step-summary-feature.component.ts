import { Component, Input, LOCALE_ID, OnInit } from '@angular/core';
import { coverageLevels, StepSummaryData } from './model/step-summary-feature.model';
import { CashedCodebookClientService } from '../../../../http/cashed-codebook-client.service';
import { CommonModule, formatDate, registerLocaleData } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import localeSr from '@angular/common/locales/sr';

registerLocaleData(localeSr); // 🇷🇸 Register Serbian locale


@Component({
  selector: 'app-step-summary-feature',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe, 
    { provide: LOCALE_ID, useValue: 'sr' }
  ], 
  templateUrl: './step-summary-feature.component.html',
  styleUrl: './step-summary-feature.component.scss'
})
export class StepSummaryFeatureComponent implements OnInit {

  @Input() summaryData: StepSummaryData | any = {
    dateFrom: '',
    dateUntil: '',
    cover: '',
    passengers19: 0,
    passengers70: 0,
    passengers71: 0,
    finalAmount: 0
  };

  coverageLevels: coverageLevels | any = null;

  constructor(private cashedCodebookClientService: CashedCodebookClientService, private router: Router, private decimalPipe: DecimalPipe) { }

  ngOnInit(): void {

    this.fillFields();

  }


  fillFields() {
    const infoOfferRequestJSON = sessionStorage.getItem('step1RequestObject');
    const selectedOfferJSON = sessionStorage.getItem('selectedOffer');
    const responseHomeInsuranceJSON = sessionStorage.getItem('responseHomeInsurance');
    const responseTrafficInsuranceJSON = sessionStorage.getItem('responseTrafficInsurance');
    if (selectedOfferJSON) {
      const selectedOffer = JSON.parse(selectedOfferJSON);
      if (infoOfferRequestJSON) {
        const infoOfferRequest = JSON.parse(infoOfferRequestJSON);
        this.summaryData.dateFrom = infoOfferRequest.startDate?  formatDate(infoOfferRequest.startDate, 'dd.MM.yyyy', 'en-US') : '';
        this.summaryData.dateUntil = infoOfferRequest.endDate? formatDate(infoOfferRequest.endDate, 'dd.MM.yyyy', 'en-US') : '';
        this.summaryData.passengers19 = infoOfferRequest?.insurantsPerAgeGroups[0]?.number;
        this.summaryData.passengers70 = infoOfferRequest?.insurantsPerAgeGroups[1]?.number;
        this.summaryData.passengers71 = infoOfferRequest?.insurantsPerAgeGroups[2]?.number;
        if(responseHomeInsuranceJSON) {
          const responseHomeInsurance = JSON.parse(responseHomeInsuranceJSON);
          this.summaryData.finalAmount = responseHomeInsurance?.finalAmount ? this.decimalPipe.transform((selectedOffer.finalAmount + responseHomeInsurance.finalAmount), '.0-2') : 0;
        }
        if(responseTrafficInsuranceJSON) {
          const responseTrafficInsurance = JSON.parse(responseTrafficInsuranceJSON);
          this.summaryData.finalAmount = responseTrafficInsurance?.finalAmount ? this.decimalPipe.transform((selectedOffer.finalAmount + responseTrafficInsurance.finalAmount), '.0-2') : 0;
        }
        if(responseHomeInsuranceJSON && responseTrafficInsuranceJSON) {
          const responseHomeInsurance = JSON.parse(responseHomeInsuranceJSON);
          const responseTrafficInsurance = JSON.parse(responseTrafficInsuranceJSON);
          this.summaryData.finalAmount = responseHomeInsurance?.finalAmount && responseTrafficInsurance?.finalAmount ? this.decimalPipe.transform((selectedOffer.finalAmount + responseHomeInsurance.finalAmount + responseTrafficInsurance.finalAmount), '.0-2') : 0;
        }
        if(!responseHomeInsuranceJSON && !responseTrafficInsuranceJSON) {
          this.summaryData.finalAmount = selectedOffer?.finalAmount ? this.decimalPipe.transform(selectedOffer.finalAmount, '.0-2') : 0;
        }
        this.cashedCodebookClientService.getCoverageLevels().subscribe(res => {
          if (res) {
            this.coverageLevels = res
            var level = res.find((item: any) => item.id === infoOfferRequest.coverrageLevelId)?.name;
            this.summaryData.cover = level + ' ' + this.decimalPipe.transform(selectedOffer.osiguranaSuma, '.0');
          }
        })
      }
    }
  }

  redirectToEdit() {
    this.router.navigate(['putno-osiguranje', 'info'])
  }


}
