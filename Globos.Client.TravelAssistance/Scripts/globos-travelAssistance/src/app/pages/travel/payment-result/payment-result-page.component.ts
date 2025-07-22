import { Component, OnInit, AfterViewInit, LOCALE_ID } from '@angular/core';
import { GbsButtonComponent } from 'ng-globos-core';
import { PaymentService } from '../../../services/payments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import { InsurancePolicyId } from './payment-result.model';
import moment from 'moment';
import localeSr from '@angular/common/locales/sr';
import { LoaderService } from '../../../services/loader.service';


registerLocaleData(localeSr);

@Component({
  selector: 'app-payment-result-page',
  standalone: true,
  imports: [CommonModule, GbsButtonComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'sr' }],
  templateUrl: './payment-result-page.component.html',
  styleUrl: './payment-result-page.component.scss',
})
export class PaymentResultPageComponent implements OnInit, AfterViewInit {
  paymentStatus: string = '';
  paymentDetails: any = {};
  policyId!: number;

  insurancePolicy!: InsurancePolicyId;

  animationComplete: boolean = false;
  animationLoaded: boolean = false;
  animationError: boolean = false;
  animationTimeout: any;

  result?: number;
  isLoading: boolean = true;

  transactionDateTime: string = '';
  policyData: any = {};

  policySaveRequest: any = {};
  clientTypeId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private payment: PaymentService,
    private router: Router,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const policyId = sessionStorage.getItem('policyId');
    const policyIdLocal = localStorage.getItem('policyId');
    if(policyId){
      this.policyId = policyId ? Number(policyId) : 0;
    }
    else{
      this.policyId = policyIdLocal ? Number(policyIdLocal) : 0
    }

    const storedSaveRequest = localStorage.getItem('policySaveRequest');
    if (storedSaveRequest) {
      this.policySaveRequest = JSON.parse(storedSaveRequest);
      this.clientTypeId = this.policySaveRequest.Client.clientTypeId;
    }

    this.transactionDateTime = moment().format("DD.MM.YYYY. HH:mm")

    const storedResponse = sessionStorage.getItem('policySaveResponse');
    if (storedResponse) {
      this.policyData = JSON.parse(storedResponse);
    }

    this.route.queryParams.subscribe(params => {
      this.confirmPayment();
    });
  }

  ngAfterViewInit(): void {
    this.animationTimeout = setTimeout(() => {
      if (!this.animationComplete) {
        // console.log('Animation timeout triggered - showing content');
        this.animationComplete = true;
        this.animationError = true;
        this.isLoading = false;
      }
    }, 5000);
  }

  loadAnimations(): void {
    if (typeof window === 'undefined' || this.animationLoaded) {
      return;
    }

    this.animationLoaded = true;

    import('lottie-web').then(lottie => {
      try {
        const animationContainer = this.result === 1
          ? document.getElementById('lottieSuccess')
          : document.getElementById('lottieError');

        if (!animationContainer) {
          console.error('Animation container not found');
          this.handleAnimationError();
          return;
        }

        const animationPath = this.result === 1
          ? '../assets/payment-success.json'
          : '../assets/payment-error.json';

        const animation = lottie.default.loadAnimation({
          container: animationContainer,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: animationPath
        });

        animation.addEventListener('DOMLoaded', () => {
          // console.log('Animation DOM loaded');
        });

        animation.addEventListener('complete', () => {
          // console.log('Animation completed');
          this.animationComplete = true;
          clearTimeout(this.animationTimeout);
        });

        animation.addEventListener('error', (err) => {
          console.error('Animation error:', err);
          this.handleAnimationError();
        });

        setTimeout(() => {
          if (!this.animationComplete) {
            // console.log('Animation completion timeout - showing content');
            this.animationComplete = true;
          }
        }, 3000);
      } catch (err) {
        console.error('Error loading animation:', err);
        this.handleAnimationError();
      }
    }).catch(err => {
      console.error('Failed to import lottie-web:', err);
      this.handleAnimationError();
    });
  }

  handleAnimationError(): void {
    this.animationError = true;
    this.animationComplete = true;
    clearTimeout(this.animationTimeout);
  }

  confirmPayment() {
    const paymentData = {
      ORDERID: this.route.snapshot.queryParamMap.get('ORDERID'),
      SHOPID: this.route.snapshot.queryParamMap.get('SHOPID'),
      AUTHNUMBER: this.route.snapshot.queryParamMap.get('AUTHNUMBER'),
      AMOUNT: this.route.snapshot.queryParamMap.get('AMOUNT'),
      CURRENCY: this.route.snapshot.queryParamMap.get('CURRENCY'),
      TRANSACTIONID: this.route.snapshot.queryParamMap.get('TRANSACTIONID'),
      MAC: this.route.snapshot.queryParamMap.get('MAC'),
      RESULT: this.route.snapshot.queryParamMap.get('RESULT'),
      AUTHORMODE: this.route.snapshot.queryParamMap.get('AUTHORMODE'),
      ACCOUNTINGMODE: this.route.snapshot.queryParamMap.get('ACCOUNTINGMODE'),
      NETWORK: this.route.snapshot.queryParamMap.get('NETWORK'),
      TRANSACTIONTYPE: this.route.snapshot.queryParamMap.get('TRANSACTIONTYPE'),
      ISSUERCOUNTRY: this.route.snapshot.queryParamMap.get('ISSUERCOUNTRY'),
      AUTHCODE: this.route.snapshot.queryParamMap.get('AUTHCODE'),
      PAYERID: this.route.snapshot.queryParamMap.get('PAYERID'),
      PAYER: this.route.snapshot.queryParamMap.get('PAYER'),
      PAYERSTATUS: this.route.snapshot.queryParamMap.get('PAYERSTATUS'),
      HASHPAN: this.route.snapshot.queryParamMap.get('HASHPAN'),
      IBAN: this.route.snapshot.queryParamMap.get('IBAN'),
      ACCOUNTHOLDER: this.route.snapshot.queryParamMap.get('ACCOUNTHOLDER'),
      ALIASSTR: this.route.snapshot.queryParamMap.get('ALIASSTR'),
      AHEMAIL: this.route.snapshot.queryParamMap.get('AHEMAIL'),
      AHTAXID: this.route.snapshot.queryParamMap.get('AHTAXID'),
      PANTAIL: this.route.snapshot.queryParamMap.get('PANTAIL'),
      AMAZONAUTHID: this.route.snapshot.queryParamMap.get('AMAZONAUTHID'),
      AMAZONCAPTUREID: this.route.snapshot.queryParamMap.get('AMAZONCAPTUREID'),
      PANEXPIRYDATE: this.route.snapshot.queryParamMap.get('PANEXPIRYDATE'),
      PANALIAS: this.route.snapshot.queryParamMap.get('PANALIAS'),
      PANALIASREV: this.route.snapshot.queryParamMap.get('PANALIASREV'),
      PANALIASEXPDATE: this.route.snapshot.queryParamMap.get('PANALIASEXPDATE'),
      PANALIASTAIL: this.route.snapshot.queryParamMap.get('PANALIASTAIL'),
      MASKEDPAN: this.route.snapshot.queryParamMap.get('MASKEDPAN'),
      ACQUIRERBIN: this.route.snapshot.queryParamMap.get('ACQUIRERBIN'),
      MERCHANTID: this.route.snapshot.queryParamMap.get('MERCHANTID'),
      CHINFO: this.route.snapshot.queryParamMap.get('CHINFO'),
      CARDTYPE: this.route.snapshot.queryParamMap.get('CARDTYPE'),
      TRECURR: this.route.snapshot.queryParamMap.get('TRECURR'),
      CRECURR: this.route.snapshot.queryParamMap.get('CRECURR')
    };

    this.payment.confirmPayment(paymentData).subscribe(
      (response) => {
        this.result = response.status
        this.isLoading = false;
        if (response.status == 1) {
          this.paymentDetails.TRANSACTIONID = this.route.snapshot.queryParamMap.get('TRANSACTIONID');
          this.paymentDetails.AMOUNT = this.route.snapshot.queryParamMap.get('AMOUNT');
          this.paymentDetails.KRAJNJI = this.paymentDetails.AMOUNT / 100;
          // console.log('Payment details:', this.paymentDetails);

          this.loadAnimations()
          this.sendToCore()
        } else {
          this.loadAnimations()
        }
      }
    );
  }

  private sendToCore() {
    this.payment.sendToCore(this.policyId).subscribe((response: any) => {
      this.changeState();
    });
  }

  private changeState() {
    this.payment.changestate({
      policyId: this.policyId,
      PolicyStateId: 2
    }).subscribe((response: any) => {
      this.printPolicy();
    });
  }

  private printPolicy() {
    this.payment.print(this.policyId).subscribe((response: any) => {
      this.printInvoice();
    });
  }

  private printInvoice() {
    this.payment.printInvoice(this.policyId).subscribe((response: any) => {
      this.updatePaymentAuthorizationNumber();
    });
  }

  private updatePaymentAuthorizationNumber(){
    var request= {policyId:this.policyId, paymentAuthorizationNumber: this.route.snapshot.queryParamMap.get('AUTHNUMBER') }
    this.payment.updatePaymentAuthorizationNumber(request).subscribe((response:any)=>{
      this.sendToClient();
    })
  }


  private sendToClient() {
    this.payment.sendToClient(this.policyId).subscribe((response: any) => {
      if (response) {
        sessionStorage.clear()
      }
    });
  }

  printPreviewPolicy(): void {
    this.loader.show();
    const payload = { policyId: this.policyId };

    this.payment.printPreviewPolicy(payload)
      .subscribe({
        next: (blob: Blob) => {
          this.loader.show();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `polisa_${this.policyId}.pdf`;
          document.body.appendChild(a);

          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.loader.hide();
        },
        error: err => {
          console.error('Download polise failed', err);
          this.loader.hide();
        }
      });
    // this.loader.hide()
  }


  navigateToHome(): void {
    this.router.navigate(['/putno-osiguranje/info']);
  }

  retryPayment(): void {
    this.router.navigate(['/putno-osiguranje/payment']);
  }
}
