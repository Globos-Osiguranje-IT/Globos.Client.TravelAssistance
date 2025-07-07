import { InsurantsPerAgeGroups } from "../../../http/dto/requests/policy.model";
import { InsuranceTypePeriodPackageResponse } from "../../../http/dto/responses/codebook-response.model";

export interface InsuranceFeatureModel {
    startDate: string;
    endDate: string;
    numberOfDays: number;
    passengers: InsurantsPerAgeGroups[];
    isInSerbia: boolean | null;
}

export interface InsuranceTypeAnnualModel {
    startDate: string;
    endDate: string;
    passengers: InsurantsPerAgeGroups[];
    days?: InsuranceTypePeriodPackageResponse;
    isInSerbia: boolean | null;
}