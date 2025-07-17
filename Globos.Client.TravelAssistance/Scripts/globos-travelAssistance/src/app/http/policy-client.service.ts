import { Injectable } from '@angular/core';
import { AdditionalCoverages, InfoofferRequest, InsurantsPerAgeGroups, PolicySaveRequest } from './dto/requests/policy.model';
import { map, Observable } from 'rxjs';
import { PostRequest } from 'ng-globos-core'
import { HttpProxyClientService } from 'ng-globos-core';
import { PolicyInfoOfferPrikaz, PolicyInfoOfferResponse } from '../features/insurance-coverage-level/model/plansModel.model';
import { CurrencyEnum, InsuranceAdditionalCoverageEnum } from '../enums';
import { AdditionalInsuranceClientResponse } from '../features/insurance-additionals/model/insuranceAdditionals.model';
import { Client } from '../features/contractor-info/model/gbs-contractor-info.model';

@Injectable({
  providedIn: 'root'
})
export class PolicyClientService {

  policyInfoOfferRequest: InfoofferRequest = {
    insuranceCategoryId: 0,
    insuranceTypeId: 0,
    insuranceTypePeriodPackageId: undefined,
    destinationId: undefined,
    promoCode: '',
    discountId: undefined,
    startDate: '',
    endDate: '',
    insurancePurchaseDate: '',
    allPassengersPresentInSerbia: undefined,
    additionalCoverageIDs: [],
    tariffGroupId: undefined,
    tariffSubgroupId: undefined,
    insuredSumId: undefined,
    coverrageLevelId: 0,
    isForStudents: false,
    insurantsPerAgeGroups: [],
    arrangementPrice: 0
  }

  infooffers: PolicyInfoOfferPrikaz[] = [];

  selectedAdditionalInsurances: number[] = [];

  responseHome: AdditionalInsuranceClientResponse = {
    amount: 0,
    taxAmount: 0,
    finalAmount: 0,
    insuranceAdditionalCoverageId: 0,
    currencyId: 0,
    durationDays: 0
  };

  responseTraffic: AdditionalInsuranceClientResponse = {
    amount: 0,
    taxAmount: 0,
    finalAmount: 0,
    insuranceAdditionalCoverageId: 0,
    currencyId: 0,
    durationDays: 0
  };

  policySaveRequest: PolicySaveRequest = {
    PolicyOffer: {
      startDate: new Date(),
      endDate: new Date(),   
      policyDate: new Date(),
      currencyId: 1, 
      coverrageLevelId: 0,
      amount: 0,
      tax: 0,
      finalAmount: 0,
      note: '',
      issuancePlace: '',
      platesNumber: '',
      chassisNumber: '',
      vehicleBrand: '',
      vehicleType: '',

      id: undefined,
      discountId: undefined,
      paymentAuthorizationNumber: '',
      stornoReason: '',
      policyNumberPrefix: '',
      discount: 0,
      isDefferedInvoicing: false,
      clientAddressId: undefined,
      clientPhoneNumberId: undefined,
      clientEmailId: undefined,
      invoiceId: undefined,
      policyNumber: '',
      agentCode: '',
    },
    Client: {
      clientTypeId: 0,
      firstName: '',
      lastName: '',
      registrationNumber: '',
      residency: 'Srpsko',
    },
    Consents: []
  };

  additionalCoverages: AdditionalCoverages = {
    additionalCoverageId: 0,
    amount: 0,
    tax: 0,
    finalAmount: 0,
    discount: 0,
    taxAfterDiscount: 0,
    finalAmountAfterDiscount: 0,

    roadAssistanceInsurance: {
      startDate: new Date(),
      endDate:  new Date(),
      platesNumber: '',
      chassisNumber: '',
      vehicleBrand: '',
      vehicleType: ''
    },
    domesticInsurance: {
      address: ''
    },
    tripCancellation: {
      travelAgencyId: 0,
      travelAgencyName: '',
      contractNumber: '',
      price: 0
    }
  };

  insurantsPerAgeGroupsTest: InsurantsPerAgeGroups[] = [
    {
      ageGroupId: 1,
      number: 2
    },
    {
      ageGroupId: 2,
      number: 2
    },
    {
      ageGroupId: 3,
      number: 0
    }
  ]

  testInfooffer: InfoofferRequest = {
    insuranceCategoryId: 1,
    insuranceTypeId: 1,
    insuranceTypePeriodPackageId: 1,
    destinationId: 1,
    promoCode: "GLOBOS2025",
    startDate: "2025-03-17",
    endDate: "2025-03-21",
    insurancePurchaseDate: "2025-03-15",
    allPassengersPresentInSerbia: true,
    additionalCoverageIDs: [],
    tariffGroupId: 1,
    tariffSubgroupId: 1,
    insuredSumId: 1,
    coverrageLevelId: 1,
    isForStudents: false,
    insurantsPerAgeGroups: this.insurantsPerAgeGroupsTest,
    arrangementPrice: 1200
  };

  constructor(private proxy: HttpProxyClientService) { }


  private postRequestInfooffer: PostRequest = {
    Url: "/policy/infooffer",
    Body: {
      "additionalCoverages": [
        {
          "id": 0,
          "insurancePolicyId": 0,
          "additionalCoverageId": 7,
          "amount": 1000,
          "tax": 20,
          "finalAmount": 1020.0,
          "roadAssistanceInsurance": null,
          "domesticInsurance": {
            "id": 0,
            "address": "TEST ADRESA"
          },
          "tripCancellation": null
        }
      ],
      "insuranceCategoryId": 1,
      "insuranceTypeId": 1,
      "insuranceTypePeriodPackageId": 1,
      "destinationId": 1,
      "promocode": "GLOBOS2025",
      "startDate": "2025-03-17",
      "endDate": "2025-03-20",
      "insurancePurchaseDate": "2025-03-15",
      "allPassengersPresentInSerbia": true,
      "additionalCoverageIDs": [],
      "tariffGroupId": 1,
      "tariffSubgroupId": 1,
      "insuredSumId": 1,
      "coverrageLevelId": 1,
      "isForStudents": false,
      "insurantsPerAgeGroups": [
        {
          "ageGroupId": 1,
          "number": 2
        },
        {
          "ageGroupId": 2,
          "number": 2
        },
        {
          "ageGroupId": 3,
          "number": 0
        }
      ]
    },
    Headers: {}
  }

  postInfooffer(): Observable<PolicyInfoOfferResponse[]> {

    var infoOfferRequest = sessionStorage.getItem("step1RequestObject");

    if (infoOfferRequest == null) infoOfferRequest = '{}';

    this.postRequestInfooffer.Body = JSON.parse(infoOfferRequest);

    return this.proxy.post('/travel/postRequest/', this.postRequestInfooffer).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    )
  }

  private postRequestAdditionalInsurance: PostRequest = {
    Url: "",
    Body: {},
    Headers: {}
  }

  postAdditionalInsurance(coverage: number): Observable<AdditionalInsuranceClientResponse> {

    var additionalInsuranceRequest = sessionStorage.getItem("additionalInsuranceRequest");

    if (additionalInsuranceRequest == null) additionalInsuranceRequest = '{}';

    this.postRequestAdditionalInsurance.Body = JSON.parse(additionalInsuranceRequest);

    if (coverage === InsuranceAdditionalCoverageEnum.OSIGURANJE_DOMACINSTVA) {
      this.postRequestAdditionalInsurance.Url = "/policy/HomeInsurance"
    }

    if (coverage === InsuranceAdditionalCoverageEnum.POMOC_NA_PUTU) {
      this.postRequestAdditionalInsurance.Url = "/policy/RoadsideAssistanceInsurance"
    }

    return this.proxy.post('/travel/postRequest/', this.postRequestAdditionalInsurance).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    )
  }

  savePolicy(): Observable<any> {
    var policySaveRequest = sessionStorage.getItem("policySaveRequest");
    if (policySaveRequest == null) policySaveRequest = '{}';
    var postPolicySaveRequest = {
      Url: "/policy/SavePolicy",
      Body: JSON.parse(policySaveRequest),
      Headers: {}
    }
    return this.proxy.post('/travel/postRequest/', postPolicySaveRequest).pipe(
      map((response: any) => {
        return response ?? [];
      })
    )
  }
}
