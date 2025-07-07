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

export interface PolicySaveRequest {
    PolicyOffer: PolicyOfferRequest;
    Client: Client;
    Insurants: Client[];
    Consents: ConsentRequest[];
}

export interface PolicyOfferRequest {
    id?: number;
    insuranceCategoryId: number;
    insuranceTypeId: number;
    insuranceTypePeriodPackageId?: number;
    destinationId: number;
    discountId?: number;
    startDate: Date;
    endDate: Date;
    policyDate: Date;
    additionalCoverages?: AdditionalCoverages[];
    tariffId: number;
    tariffGroupId: number;
    tariffSubgroupId: number;
    currencyId: number;
    paymentAuthorizationNumber?: string;
    insuredSumId: number;
    coverrageLevelId: number;
    isForStudents?: boolean;
    insurantsPerAgeGroups: InsurantsPerAgeGroups[];
    stornoReason?: string;
    policyNumberPrefix?: string;
    territorialCoverageId: number;
    discount?: number;
    travelInsuranceDiscount: number;
    travelInsuranceFinalAmount: number;
    amount: number;
    tax: number;
    taxTravelInsuranceAfterDiscount: number;
    additionalInsuranceAmount?: number;
    additionalInsuranceTax?: number;
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
    // allPassengersPresentInSerbia?: boolean;
    // additionalCoverageIDs?: number[];    
}

export interface ConsentRequest {
    id?: number;
    consentId: number;
    insurancePolicyId?: number;
    clientId?: number;
}
