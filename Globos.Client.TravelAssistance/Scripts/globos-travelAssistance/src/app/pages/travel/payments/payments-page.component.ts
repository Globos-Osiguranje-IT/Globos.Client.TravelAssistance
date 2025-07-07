import { ChangeDetectorRef, Component, LOCALE_ID, OnInit } from '@angular/core';
import { GbsButtonComponent } from 'ng-globos-core';
import { DomSanitizer } from '@angular/platform-browser';
import { PaymentService } from '../../../services/payments.service';
import { ClientResponse, InsurancePolicyResponse, CityResponse, InvoiceResponse, PolicyAnnexResponse, 
  PolicyAnnexAdditionalCoverageResponse, PolicyClientConsentResponse, ConsentResponse, ClientPhoneNumberResponse, 
  ClientAddressResponse, ClientEmailResponse, TariffResponse, CurrencyResponse, ApplicationDiscountResponse, 
  DestinationResponse, InsuranceCategoryResponse, InsuranceTypeResponse, InsuranceTypePeriodPackageResponse, 
  PolicyStateResponse, TariffSubgroupResponse, TariffGroupResponse, DiscountTypeResponse } from '../../../http/dto/responses/payments-response.model';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { LoaderService } from '../../../services/loader.service';
import { CodebookClientService } from '../../../http/codebook-client.service';
import { InsuredSumResponse } from '../../../http/dto/responses/codebook-response.model';
import localeSr from '@angular/common/locales/sr';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CashedCodebookClientService } from '../../../http/cashed-codebook-client.service';

registerLocaleData(localeSr);
@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [GbsButtonComponent, CommonModule],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'sr' }],
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.scss']
})
export class PaymentsPageComponent implements OnInit {
  paymentForm: any = '';
  infoOfferRequest: any;
  checkStatus: number | null = null;
  checkPolicyDone: boolean = false;
  checkMessage: string = '';

  insuredSums: InsuredSumResponse[] = [];

  client?: ClientResponse;
  policy?: InsurancePolicyResponse;
  invoice?: InvoiceResponse;
  annexes?: PolicyAnnexResponse;
  insurants?: ClientResponse[] = [];
  additionalCoverages?: PolicyAnnexAdditionalCoverageResponse[];
  additionalCoveragesTaxAmount: number = 0;
  finalTax:number=0;
  additionalInsuranceAmount: number = 0;
  roadinsuranceAmount: number = 0; showroadinsurance:boolean=false;
  homeinsuranceAmount: number = 0; showhomeinsurance:boolean=false;
  policyId!: number 

  clientTypeId: number = 0;
  policySaveRequest: any;

  constructor(private payment: PaymentService,
              private codeBook: CodebookClientService, 
              private sanitizer: DomSanitizer,
              private loader: LoaderService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private cashedSessionService: CashedCodebookClientService,
            ) {}

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    this.loader.show();

    const podaci = sessionStorage.getItem('policySaveResponse');
    const policySaveRequest = sessionStorage.getItem('policySaveRequest');

    if (podaci) {
      this.infoOfferRequest = JSON.parse(podaci);
      this.policySaveRequest = JSON.parse(policySaveRequest!);
      this.clientTypeId = this.policySaveRequest.Client.clientTypeId;

      if (!this.infoOfferRequest.id) {
        this.loader.hide();
        return;
      }

      this.policyId = this.infoOfferRequest.id;
      sessionStorage.setItem('policyId', this.policyId.toString());
      localStorage.setItem('policyId', this.policyId.toString());
      sessionStorage.setItem('policySaveResponse', JSON.stringify(this.infoOfferRequest));
      sessionStorage.setItem('policySaveRequest', JSON.stringify(this.policySaveRequest));

      try {
        // console.log('Loading all data...');
        await Promise.all([
          this.loadClientData(),
          this.loadInsurantsData(),
          this.loadInsuredSums(),
          this.loadPolicyData(),
          this.loadInvoiceData(),
          this.loadAnnexesData(),
          this.loadAdditionalCoveragesData()
        ]);
        // console.log('All data loaded.');
        await this.checkPolicyCore();
        // console.log('Policy core checked, status:', this.checkStatus);
        if (this.checkStatus === 1) {
          await this.loadPaymentForm();
          // console.log('Payment form loaded.');
        }
      } catch (error) {
        console.error('Error in payments-page:', error);
      } finally {
        this.loader.hide();
      }
    } else {
      this.loader.hide();
    }
  }

  async loadClientData(): Promise<void> {
    this.client = this.mapClientData(this.infoOfferRequest.client);
  }

  async loadInsurantsData(): Promise<void> {
    if(this.infoOfferRequest.insurants){
      this.insurants = this.infoOfferRequest.insurants ? this.infoOfferRequest.insurants.map(this.mapClientData) : [];
    }else{
    }
  }

  async loadPolicyData(): Promise<void> {
    this.policy = this.mapPolicyData(this.infoOfferRequest);
  }

  async loadInvoiceData(): Promise<void> {
    if (this.infoOfferRequest.invoice) {
      this.invoice = this.mapInvoiceData(this.infoOfferRequest.invoice);
    } else {
    }
  }
  
  async loadAnnexesData(): Promise<void> {
    if (this.infoOfferRequest.annexes) {
      this.annexes = this.infoOfferRequest.annexes.map(this.mapPolicyAnnexData);
    } else {
    }
  }
  
  async loadAdditionalCoveragesData(): Promise<void> {
    if (this.infoOfferRequest.additionalCoverages) {
      this.additionalCoverages = this.infoOfferRequest.additionalCoverages.map(this.mapAdditionalCoverages);
    } else {
    }
  }

  async loadPaymentForm(): Promise<void> {
    this.payment.getPaymentForm(this.policyId).subscribe((response: any) => {
      this.paymentForm = this.sanitizer.bypassSecurityTrustHtml(response.paymentPage);
    });
  }

  async loadInsuredSums(): Promise<void> {
    // this.codeBook.getInsuredSum().subscribe((response: any) => {
    //   this.insuredSums = response;
    // })
    return new Promise<void>((resolve, reject) => {
      this.cashedSessionService.getInsuredSum().subscribe({
        next: (response: any) => {
          this.insuredSums = response;
          resolve();
        },
        error: reject
      });
    });
  }

  async checkPolicyCore(): Promise<void> {
    const response: any = await firstValueFrom(this.payment.checkPolicyCore(this.policyId));
      this.checkStatus = response.response.status;
      this.checkMessage = response.response.message;
      this.checkPolicyDone = true;
      this.cdr.detectChanges();
  }

  getInsuredSumAmount(insuredSumId: number | undefined): number {
    if (insuredSumId === undefined) return 0;
    const insuredSum = this.insuredSums.find(sum => sum.id === insuredSumId);
    return insuredSum ? insuredSum.amount : 0;
  }

  getDaysDifference(startDate: Date | undefined, endDate: Date | undefined): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const timeDiff = end.getTime() - start.getTime();
    
    return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  private mapClientData(clientData: any): ClientResponse {
    return {
      Id: clientData.id,
      FirstName: clientData.firstName,
      LastName: clientData.lastName,
      CompanyName: clientData.companyName,
      RegistrationNumber: clientData.registrationNumber,
      TaxIdentificationNumber: clientData.taxIdentificationNumber,
      BirthDate: new Date(clientData.birthDate),
      Gender: clientData.gender,
      PassportNumber: clientData.passportNumber,
      Residency: clientData.residency,
      Email: clientData.email,
      Address: clientData.address,
      ZipCode: clientData.zipCode,
      City: clientData.city,
      Phone: clientData.phone
    };
  }

  private mapPolicyData(policyData: any): InsurancePolicyResponse {
    let additionalcoverages = this.mapAdditionalCoverages(policyData.additionalCoverages) as any[]
    if(additionalcoverages.length>0){
      let homeinsurance= additionalcoverages.find(hi=>hi.InsuranceAdditionalCoverageId===8);
      let roadinsurace = additionalcoverages.find(hi=>hi.InsuranceAdditionalCoverageId===9);
      
      this.showhomeinsurance = homeinsurance ? true:false 
      this.showroadinsurance = roadinsurace ? true:false 

       if (this.showhomeinsurance && this.showroadinsurance) {
        this.homeinsuranceAmount = homeinsurance.Amount;
        this.roadinsuranceAmount = roadinsurace.Amount;
        this.additionalCoveragesTaxAmount = homeinsurance.Tax + roadinsurace.Tax;
      } 
      else if (this.showhomeinsurance && !this.showroadinsurance) {
        this.homeinsuranceAmount = homeinsurance.Amount;
        this.additionalCoveragesTaxAmount += homeinsurance.Tax;
      } 
      else if (!this.showhomeinsurance && this.showroadinsurance) {
        this.roadinsuranceAmount = roadinsurace.Amount;
        this.additionalCoveragesTaxAmount += roadinsurace.Tax;
      }

      // this.homeinsuranceAmount=homeinsurance.Amount;
      // this.roadinsuranceAmount=roadinsurace.Amount;    
      // this.additionalCoveragesTaxAmount = homeinsurance.Tax + roadinsurace.Tax;
    } 
    
    this.additionalInsuranceAmount = policyData.additionalInsuranceAmount-this.homeinsuranceAmount -this.roadinsuranceAmount
    
    var tax = ((policyData.amount+this.additionalInsuranceAmount)-policyData.discount)*0.05

    this.finalTax= tax+this.additionalCoveragesTaxAmount
    
    return {
      Id: policyData.id,
      Number: policyData.number,
      CoreSystemNumber: policyData.coreSystemNumber,
      PolicyDate: new Date(policyData.policyDate),
      StartDate: new Date(policyData.startDate),
      EndDate: new Date(policyData.endDate),
      InsuranceCategoryId: policyData.insuranceCategoryId,
      InsuranceTypeId: policyData.insuranceTypeId,
      InsuranceTypePeriodPackageId: policyData.insuranceTypePeriodPackageId,
      DestinationId: policyData.destinationId,
      Amount: policyData.amount,
      Tax: policyData.tax,
      TaxTravelInsuranceAfterDiscount: policyData.taxTravelInsuranceAfterDiscount,
      Discount: policyData.discount,
      TravelInsuranceDiscount: policyData.travelInsuranceDiscount,
      TravelInsuranceFinalAmount: policyData.travelInsuranceFinalAmount,
      FinalAmount: policyData.finalAmount,
      IsPayed: policyData.isPayed,
      IsSentToClient: policyData.isSentToClient,
      PolicyStateId: policyData.policyStateId,
      CurrencyId: policyData.currencyId,
      PaymentAuthorizationNumber: policyData.paymentAuthorizationNumber,
      IsDefferedInvoicing: policyData.isDefferedInvoicing,
      IsForStudents: policyData.isForStudents,
      AgentId: policyData.agentId,
      AgentCode: policyData.agentCode,
      AdditionalInsuranceAmount: policyData.additionalInsuranceAmount,
      AdditionalInsuranceTax: policyData.additionalInsuranceTax,
      Invoice: policyData.invoice ? this.mapInvoiceData(policyData.invoice) : {} as InvoiceResponse,
      Annexes: Array.isArray(policyData.annexes) ? policyData.annexes.map(this.mapPolicyAnnexData) : [],
      AdditionalCoverages: Array.isArray(policyData.additionalCoverages) ? this.mapAdditionalCoverages(policyData.additionalCoverages) : [],
      Client: this.mapClientData(policyData.client),
      Insurants: policyData.insurants ? policyData.insurants.map(this.mapClientData) : [],
      Consents: policyData.consents ? policyData.consents.map(this.mapPolicyClientConsentData) : [],
      ClientPhoneNumber: policyData.clientPhoneNumber ? this.mapClientPhoneNumberData(policyData.clientPhoneNumber) : null,
      ClientAddress: policyData.clientAddress ? this.mapClientAddressData(policyData.clientAddress) : null,
      ClientEmail: policyData.clientEmail ? this.mapClientEmailData(policyData.clientEmail) : null,
      Tariff: policyData.tariff ? this.mapTariffData(policyData.tariff) : null,
      Currency: this.mapCurrencyData(policyData.currency),
      ApplicationDiscount: this.mapApplicationDiscountData(policyData.applicationDiscount),
      Destination: this.mapDestinationData(policyData.destination),
      InsuranceCategory: this.mapInsuranceCategoryData(policyData.insuranceCategory),
      InsuranceType: this.mapInsuranceTypeData(policyData.insuranceType),
      InsuranceTypePeriodPackage: policyData.insuranceTypePeriodPackage ? this.mapInsuranceTypePeriodPackageData(policyData.insuranceTypePeriodPackage) : null, 
      PolicyState: this.mapPolicyStateData(policyData.policyState),
      TariffId: policyData.tariffId || 0
    };
  }
  

  private mapInvoiceData(invoiceData: any): InvoiceResponse {
    return {
      Id: invoiceData.id,
      Number: invoiceData.number,
      Date: new Date(invoiceData.date),
      Amount: invoiceData.amount,
      Tax: invoiceData.tax,
      Discount: invoiceData.discount,
      FinalAmount: invoiceData.finalAmount,
      CurrencyId: invoiceData.currencyId
    };
  }

  private mapPolicyAnnexData(annexData: any): PolicyAnnexResponse {
    return {
      Id: annexData.id,
      StartDate: new Date(annexData.startDate),
      EndDate: new Date(annexData.endDate),
      Amount: annexData.amount,
      Tax: annexData.tax,
      FinalAmount: annexData.finalAmount,
      AdditionalCoverages: annexData.additionalCoverages.map(this.mapPolicyAnnexAdditionalCoverageData)
    };
  }

  private mapPolicyAnnexAdditionalCoverageData(coverageData: any): PolicyAnnexAdditionalCoverageResponse {
    return {
      Id: coverageData.id,
      Amount: coverageData.amount,
      Tax: coverageData.tax,
      FinalAmount: coverageData.finalAmount,
      Discount: coverageData.Discount,
      TaxAfterDiscount: coverageData.TaxAfterDiscount,
      FinalAmountAfterDiscount: coverageData.FinalAmountAfterDiscount,    
      Data: coverageData.data,
      DataVersion: coverageData.dataVersion
    };
  }

  private mapAdditionalCoverages(additionalCoverages: any[]): PolicyAnnexAdditionalCoverageResponse[] {
    if (!Array.isArray(additionalCoverages)) {
      return [];
    }
    
    return additionalCoverages.map(coverage => ({
      Id: coverage.id ?? 0,
      InsurancePolicyId: coverage.insurancePolicyId ?? 0,
      InsuranceAdditionalCoverageId: coverage.insuranceAdditionalCoverageId ?? 0,
      Amount: coverage.amount ?? 0,
      Tax: coverage.tax ?? 0,
      FinalAmount: coverage.finalAmount ?? 0,
      Discount: coverage.Discount  ?? 0,
      TaxAfterDiscount: coverage.TaxAfterDiscount  ?? 0,
      FinalAmountAfterDiscount: coverage.FinalAmountAfterDiscount  ?? 0,
      CurrencyId: coverage.currencyId ?? 0,
      Data: coverage.data ?? '',
      DataVersion: coverage.dataVersion ?? ''
    }));
  }
  

  private mapPolicyClientConsentData = (consentData: any): PolicyClientConsentResponse => {
    if (!consentData || !consentData.consent) {
      return {} as PolicyClientConsentResponse; 
    }
  
    return {
      Id: consentData.id,
      ClientId: consentData.clientId,
      InsertDate: new Date(consentData.insertDate), 
      Consent: this.mapConsentData(consentData.consent)
    };
  }
  
  private mapConsentData = (consentData: any): ConsentResponse => {
    if (!consentData) {
      return {} as ConsentResponse;
    }
  
    return {
      id: consentData.id,
      name: consentData.name,
      documentPath: consentData.documentPath || '',
      isMandatory: consentData.isMandatory || false,
      isValid: consentData.isValid || false
    };
  }
  

  private mapClientPhoneNumberData(phoneData: any): ClientPhoneNumberResponse {
    return { Id: phoneData.id, PhoneNumber: phoneData.phoneNumber };
  }

  private mapClientAddressData(addressData: any): ClientAddressResponse {
    return {
      Id: addressData.id,
      Street: addressData.street,
      HouseNumber: addressData.houseNumber,
      CityId: addressData.cityId,
      City: this.mapCityData(addressData.city)
    };
  }

  private mapCityData(cityData: any): CityResponse {
    return {
      Id: cityData.id,
      Name: cityData.name,
      Zip: cityData.zip
    };
  }

  private mapClientEmailData(emailData: any): ClientEmailResponse {
    return { Id: emailData.id, Email: emailData.email };
  }

  private mapTariffData(tariffData: any): TariffResponse {
    return {
      Id: tariffData.id,
      TerritorialCoverageId: tariffData.territorialCoverageId,
      InsuredSumId: tariffData.insuredSumId,
      CoverrageLevelId: tariffData.coverrageLevelId,
      TariffSubgroupId: tariffData.tariffSubgroupId,
      IsValid: tariffData.isValid,
      AgentTypeId: tariffData.agentTypeId,
      TariffGroupCode: tariffData.tariffGroupCode,
      TariffCodeCore: tariffData.tariffCodeCore,
      TariffSubgroup: this.mapTariffSubgroupData(tariffData.tariffSubgroup)
    };
  }

  private mapTariffSubgroupData(tariffSubgroupData: any): TariffSubgroupResponse {
    return {
      Id: tariffSubgroupData.id,
      TariffGroupId: tariffSubgroupData.tariffGroupId,
      Name: tariffSubgroupData.name,
      TariffGroup: this.mapTariffGroupData(tariffSubgroupData.tariffGroup)
    };
  }

  private mapTariffGroupData(tariffGroupData: any): TariffGroupResponse {
    return { Id: tariffGroupData.id, Name: tariffGroupData.name };
  }

  private mapCurrencyData(currencyData: any): CurrencyResponse {
    return {
      Id: currencyData.id,
      Name: currencyData.name,
      Symbol: currencyData.symbol,
      ISOName: currencyData.isoName
    };
  }

  private mapApplicationDiscountData(discountData: any): ApplicationDiscountResponse {
    return {
      Id: discountData.id,
      Discount: discountData.discount,
      StartDate: new Date(discountData.startDate),
      EndDate: new Date(discountData.endDate),
      ApplicationId: discountData.applicationId,
      InsertDate: new Date(discountData.insertDate),
      Promocode: discountData.promocode,
      DiscountTypeId: discountData.discountTypeId,
      AgentCode: discountData.agentCode,
      DiscountType: this.mapDiscountTypeData(discountData.discountType)
    };
  }

  private mapDiscountTypeData(discountTypeData: any): DiscountTypeResponse {
    return { Id: discountTypeData.id, Name: discountTypeData.name };
  }

  private mapDestinationData(destinationData: any): DestinationResponse {
    return {
      id: destinationData.id,
      name: destinationData.name,
      nameEng: destinationData.nameEng,
      nameEngShort: destinationData.nameEngShort,
      iso: destinationData.iso
    };
  }

  private mapInsuranceCategoryData(categoryData: any): InsuranceCategoryResponse {
    return { id: categoryData.id, name: categoryData.name };
  }

  private mapInsuranceTypeData(typeData: any): InsuranceTypeResponse {
    return { id: typeData.id, name: typeData.name };
  }

  private mapInsuranceTypePeriodPackageData(packageData: any): InsuranceTypePeriodPackageResponse | null {
    if (!packageData) {
      return null;
    }
    return { 
      id: packageData.id, 
      periodDays: packageData.periodDays, 
      insuranceTypeId: packageData.insuranceTypeId 
    };
  }

  private mapPolicyStateData(stateData: any): PolicyStateResponse {
    return { id: stateData.id, name: stateData.name };
  }

  navigateToHome(){
    this.router.navigate(['/putno-osiguranje', 'info']);
  }

  goToPreviousStep(){
    this.router.navigate(['putno-osiguranje', 'passanger'])
  }
}
