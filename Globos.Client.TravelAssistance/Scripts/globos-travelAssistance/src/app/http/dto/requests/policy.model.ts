import { Client } from "../../../features/contractor-info/model/gbs-contractor-info.model";

export interface InfoofferRequest {
    insuranceCategoryId: number;
    insuranceTypeId: number;
    insuranceTypePeriodPackageId?: number;
    destinationId?: number;
    promoCode: string;
    discountId?: number;
    startDate: string;
    endDate: string;
    insurancePurchaseDate: string;
    allPassengersPresentInSerbia?: boolean;
    additionalCoverageIDs?: number[];
    tariffGroupId?: number;
    tariffSubgroupId?: number;
    insuredSumId?: number;
    coverrageLevelId: number;
    isForStudents: boolean;
    insurantsPerAgeGroups: InsurantsPerAgeGroups[];
    arrangementPrice: number;
    agentCode?:string;
}

export interface AdditionalCoverages {
    id?: number;
    insurancePolicyId?: number;
    additionalCoverageId: number;
    amount: number;
    tax: number;
    finalAmount: number;
    discount: number;
    taxAfterDiscount: number;
    finalAmountAfterDiscount: number;
    currencyId?: number;
    roadAssistanceInsurance?: RoadAssistanceInsurance;
    domesticInsurance?: DomesticInsurance;
    tripCancellation?: TripCancellation;
}

export interface RoadAssistanceInsurance {
    id?: number;
    startDate:Date;
    endDate: Date;
    platesNumber: string;
    chassisNumber: string;
    vehicleBrand: string;
    vehicleType: string;
}

export interface DomesticInsurance {
    id?: number;
    address: string;
}

export interface TripCancellation {
    id?: number;
    travelAgencyId: number;
    travelAgencyName: string;
    contractNumber: string;
    price: number;
}

export interface InsurantsPerAgeGroups {
    ageGroupId: number;
    number: number;
}


export interface PolicyOfferRequest {
    id?: number;
    discountId?: number;
    startDate: Date;
    endDate: Date;
    policyDate: Date;
    currencyId: number;
    paymentAuthorizationNumber?: string;
    coverrageLevelId: number;
    stornoReason?: string;
    policyNumberPrefix?: string;
    discount?: number;
    amount: number;
    tax: number;
    finalAmount: number;
    isDefferedInvoicing?: boolean;
    clientAddressId?: number;
    clientPhoneNumberId?: number;
    clientEmailId?: number;
    invoiceId?: number;
    policyNumber?: string;
    note: string;
    issuancePlace: string;
    agentCode?:string;
    platesNumber: string;
    chassisNumber: string;
    vehicleBrand: string;
    vehicleType: string;
}


export interface ConsentRequest {
    id?: number;
    consentId: number;
    insurancePolicyId?: number;
    clientId?: number;
}


export interface PolicySaveRequest {
    PolicyOffer: PolicyOfferRequest;
    Client: Client;
    Consents: ConsentRequest[];
}
