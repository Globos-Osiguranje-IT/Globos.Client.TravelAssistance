import { Injectable } from '@angular/core';
import { GetRequest, HttpProxyClientService, PostRequest } from 'ng-globos-core';
import { Observable, map, switchMap } from 'rxjs';
import { InsurancePolicyId } from '../pages/travel/payment-result/payment-result.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpProxyClientService) {}

  getPaymentForm(policyId: number): Observable<any> {
    // console.log(policyId, 'sta je ovo')
    let postRequest: PostRequest = {
      Url: `/Payment/initiate?policyId=${policyId}`,
      Body: { policyId },
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  checkPolicyCore(policyId: number): Observable<any>{
    let postRequest: PostRequest = {
      Url: `/Policy/checkpolicycore?PolicyId=${policyId}`,
      Body: { policyId },
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log('sta je response', response)
        return response;
      })
    );
  }

  sendToCore(policyId: number): Observable<any> {
    let postRequest: PostRequest = {
      Url: `/Policy/sendtocore?PolicyId=${policyId}`,
      Body: { policyId },
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log(response, 'sta je sendToCore')
        return response ?? [];
      })
    );
  }

  changestate(request: any): Observable<any> {
    request.PolicyId = request.policyId || 0;
    request.PolicyStateId = request.PolicyStateId || 0;

    let postRequest: PostRequest = {
      Url: '/Policy/changestate',
      Body: request,
      Headers: { "Accept": "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log(response, 'sta je changestate')
        return response ?? [];
      })
    );
  }

  print(policyId: number): Observable<any> {
    let postRequest: PostRequest = {
      Url: `/Policy/print?policyId=${policyId}`,
      Body: { policyId },
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log(response, 'sta je print')
        return response ?? [];
      })
    );
  }

  printPreviewPolicy(model: InsurancePolicyId): Observable<Blob> {
    const request: PostRequest = {
      Url: '/Policy/PrintPreviewPolicy',
      Body: { 'policyId': model.policyId },
      Headers: { "Accept" : 'application/pdf' }
    };
  
    return this.http.postBlob('/travel/PrintPreview/', request);
  }
  

  printInvoice(policyId: number): Observable<any> {
    let postRequest: PostRequest = {
      Url: `/Policy/PrintInvoice`,
      Body: {'policyId': policyId },
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log(response, 'sta je printInvoice')
        return response ?? [];
      })
    );
  }

  sendToClient(policyId: number): Observable<any> {
    let postRequest: PostRequest = {
      Url: `/Policy/SendToClient`,
      Body: { 'policyId': policyId },
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log(response, 'sta je sendtoclient')
        return response ?? [];
      })
    );
  }

  updatePaymentAuthorizationNumber(request: any): Observable<any> {
    request.PolicyId = request.policyId || 0;
    request.PaymentAuthorizationNumber = request.paymentAuthorizationNumber || '';
    let postRequest: PostRequest = {
      Url: `/Policy/UpdatePaymentAuthorizationNumber`,
      Body: request,
      Headers: { "Accept" : "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        // console.log(response, 'sta je UpdatePaymentAuthorizationNumber')
        return response ?? [];
      })
    );
  }

  confirmPayment(request: any): Observable<any> {
    request.ORDERID = request.ORDERID || '';
    request.SHOPID = request.SHOPID || '';
    request.AUTHNUMBER = request.AUTHNUMBER || '';
    request.AMOUNT = request.AMOUNT || 0;
    request.CURRENCY = request.CURRENCY || 0;
    request.TRANSACTIONID = request.TRANSACTIONID || '';
    request.MAC = request.MAC || '';
    request.RESULT = request.RESULT || '';
    request.AUTHORMODE = request.AUTHORMODE || '';
    request.ACCOUNTINGMODE = request.ACCOUNTINGMODE || '';
    request.NETWORK = request.NETWORK || '';
    request.TRANSACTIONTYPE = request.TRANSACTIONTYPE || '';
    request.ISSUERCOUNTRY = request.ISSUERCOUNTRY || '';
    request.AUTHCODE = request.AUTHCODE || '';
    request.PAYERID = request.PAYERID || '';
    request.PAYER = request.PAYER || '';
    request.PAYERSTATUS = request.PAYERSTATUS || '';
    request.HASHPAN = request.HASHPAN || '';
    request.IBAN = request.IBAN || '';
    request.ACCOUNTHOLDER = request.ACCOUNTHOLDER || '';
    request.ALIASSTR = request.ALIASSTR || '';
    request.AHEMAIL = request.AHEMAIL || '';
    request.AHTAXID = request.AHTAXID || '';
    request.PANTAIL = request.PANTAIL || '';
    request.AMAZONAUTHID = request.AMAZONAUTHID || '';
    request.AMAZONCAPTUREID = request.AMAZONCAPTUREID || '';
    request.PANEXPIRYDATE = request.PANEXPIRYDATE || '';
    request.PANALIAS = request.PANALIAS || '';
    request.PANALIASREV = request.PANALIASREV || '';
    request.PANALIASEXPDATE = request.PANALIASEXPDATE || '';
    request.PANALIASTAIL = request.PANALIASTAIL || '';
    request.MASKEDPAN = request.MASKEDPAN || '';
    request.ACQUIRERBIN = request.ACQUIRERBIN || '';
    request.MERCHANTID = request.MERCHANTID || '';
    request.CHINFO = request.CHINFO || '';
    request.CARDTYPE = request.CARDTYPE || '';
    request.TRECURR = request.TRECURR || '';
    request.CRECURR = request.CRECURR || '';
  
    let postRequest: PostRequest = {
      Url: '/Payment/confirm',
      Body: request ,
      Headers: { "Accept": "application/json" },
    };
  
    return this.http.post('/travel/postRequest/', postRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }
}
