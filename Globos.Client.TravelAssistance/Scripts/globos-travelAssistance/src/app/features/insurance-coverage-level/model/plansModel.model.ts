export interface Plan{
    id: number;
    price: string;
    coverage: string;
    exclusions: string;
    cost: number;
    oldCost?: number
}

export interface PolicyInfoOfferResponse {
    additionalCoverages: PolicyAdditionalCoverageResponse[];
    additionalInsuranceAmount: number;
    additionalInsuranceTax: number;
    amount: number;
    coverageLevelId: number,
    discount: number;
    travelInsuranceDiscount: number;
    travelInsuranceFinalAmount: number;
    discountId: number;
    discountNote: string;
    finalAmount: number;
    insuranceSumId: number;
    tariffId: number;
    tariffGroupId: number;
    tariffSubgroupId: number;
    tax: number;
    taxTravelInsuranceAfterDiscount: number;
    territorialCoverageId: number;
}

export interface PolicyAdditionalCoverageResponse{
    id: number;
    insurancePoliciyId: number;
    insuranceAdditionalCoverageId: number;
    amounut: number;
    tex: number;
    finalAmount: number;
    discount: number;
    taxAfterDiscount: number;
    finalAmountAfterDiscount: number;
    currencyId: number;
    data: string;
    dataVersion: string;
}

export interface PolicyInfoOfferPrikaz {
    additionalCoverages: PolicyAdditionalCoverageResponse[];
    additionalInsuranceAmount: number;
    additionalInsuranceTax: number;
    amount: number;
    coverageLevelId: number,
    discount: number;
    travelInsuranceDiscount: number;
    travelInsuranceFinalAmount: number;
    discountId: number;
    discountNote: string;
    finalAmount: number;
    insuranceSumId: number;
    osiguranaSuma: number;
    tariffId: number;
    tariffGroupId: number;
    tariffSubgroupId: number;
    tax: number;
    taxTravelInsuranceAfterDiscount: number;
    territorialCoverageId: number;
    territorialName: string;
}
