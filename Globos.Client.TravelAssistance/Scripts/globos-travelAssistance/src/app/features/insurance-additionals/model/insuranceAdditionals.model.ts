export interface AdditionalInsuranceClientResponse {
    amount: number;
    taxAmount: number;
    finalAmount: number;
    insuranceAdditionalCoverageId: number;
    currencyId: number;
    durationDays?: number;
}