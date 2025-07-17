export interface InsuranceCategoryResponse {
  id: number;
  name: string;
}

export interface CodebookResponse {
  id: number;
  name: string;
}

export interface InusranceCoverageLevelResponse {
  id: number;
  name: string;
}

export interface InfoOfferResponse {
  amount: number;
  coverrageLevelId: number;
  coverrageLevelName: string;
  discount?: number;
  discountId?: number;
  finalAmount: number;
  tax?: number;
}

export interface InsuranceTypeResponse {
  id: number;
  name: string;
}

export interface InsuredAgeGroupsResponse {
  id: number;
  ageFrom: number;
  ageTo: number;
}

export interface TerritorialCoverageResponse {
  id: number;
  name: string;
}

export interface InsuranceAdditionalCoverageResponse {
  id: number;
  name: string;
  isSurcharger: boolean;
  isActive: boolean;
  checked: boolean;
  price: number;
}

export interface City {
  id: number;
  name: string;
  zip: string;
}

export interface InsuranceTypePeriodPackageResponse {
  id: number;
  periodDays: number;
  insuranceTypeId: number;
}

export interface InsuredSumResponse {
  id: number;
  amount: number;
  currencyId: number;
}

export interface DestinationTerritorialCoverage {
  id: number;
  destinationId: number;
  territorialCoverageId: number;
  isActive: boolean;
}
