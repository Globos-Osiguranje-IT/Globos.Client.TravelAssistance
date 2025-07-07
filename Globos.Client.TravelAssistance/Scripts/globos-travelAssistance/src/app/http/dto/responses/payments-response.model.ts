export interface InsurancePolicyResponse {
  Id: number;
  Number?: string;
  CoreSystemNumber?: string;
  PolicyDate: Date;
  StartDate: Date;
  EndDate: Date;
  InsuranceCategoryId?: number;
  InsuranceTypeId?: number;
  InsuranceTypePeriodPackageId?: number;
  DestinationId: number;
  ApplicationDiscountId?: number;
  Discount?: number;
  TravelInsuranceDiscount?: number;
  TravelInsuranceFinalAmount: number;
  Amount: number;
  Tax: number;
  TaxTravelInsuranceAfterDiscount: number;
  FinalAmount: number;
  IsPayed: boolean;
  IsSentToClient: boolean;
  PolicyStateId: number;
  TariffId: number;
  CurrencyId: number;
  PaymentAuthorizationNumber?: string;
  IsDefferedInvoicing: boolean;
  IsForStudents: boolean;
  AgentId: number;
  AgentCode?: string;
  StornoReason?: string;
  AdditionalInsuranceAmount?: number;
  AdditionalInsuranceTax?: number;
  Invoice?: InvoiceResponse;
  Annexes?: PolicyAnnexResponse[];
  AdditionalCoverages?: PolicyAnnexAdditionalCoverageResponse[];
  Client?: ClientResponse;
  Insurants?: ClientResponse[];
  Consents?: PolicyClientConsentResponse[];
  ClientPhoneNumber?: ClientPhoneNumberResponse | null;
  ClientAddress?: ClientAddressResponse | null;
  ClientEmail?: ClientEmailResponse | null;
  Tariff: TariffResponse | null;
  Currency: CurrencyResponse;
  ApplicationDiscount: ApplicationDiscountResponse;
  Destination: DestinationResponse;
  InsuranceCategory: InsuranceCategoryResponse;
  InsuranceType: InsuranceTypeResponse;
  InsuranceTypePeriodPackage: InsuranceTypePeriodPackageResponse | null;
  PolicyState: PolicyStateResponse;
}

export interface InvoiceResponse {
  Id: number;
  Number: string;
  Date: Date;
  Amount: number;
  Tax: number;
  Discount: number;
  FinalAmount: number;
  CurrencyId: number;
}

export interface PolicyAnnexResponse {
  Id: number;
  StartDate: Date;
  EndDate: Date;
  Amount: number;
  Tax: number;
  AdditionalInsuranceAmount?: number;
  AdditionalInsuranceTax?: number;
  Discount?: number;
  FinalAmount: number;
  AdditionalCoverages: PolicyAnnexAdditionalCoverageResponse[];
}

export interface PolicyAnnexAdditionalCoverageResponse {
  Id: number;
  Amount?: number;
  Tax?: number;
  FinalAmount?: number;
  Discount: number;
  TaxAfterDiscount: number;
  FinalAmountAfterDiscount: number;    
  Data: string;
  DataVersion: string;
}

export interface ClientResponse {
  Id: number;
  FirstName: string;
  LastName: string;
  CompanyName: string;
  RegistrationNumber: string;
  TaxIdentificationNumber: string;
  BirthDate?: Date;
  Gender?: boolean;
  PassportNumber: string;
  Residency: string;
  Email: string;
  Address: string;
  ZipCode: string;
  City: string;
  Phone: string;
}

export interface PolicyClientConsentResponse {
  Id: number;
  ClientId: number;
  InsertDate: Date;
  Consent: ConsentResponse;
}

export interface ConsentResponse {
  id: number;
  name: string;
  documentPath: string;
  isMandatory: boolean;
  isValid: boolean;
}

export interface ClientPhoneNumberResponse {
  Id: number;
  PhoneNumber: string;
}

export interface ClientAddressResponse {
  Id: number;
  Street: string;
  HouseNumber: string;
  CityId: number;
  City: CityResponse;
}

export interface CityResponse {
  Id: number;
  Name: string;
  Zip: string;
}

export interface ClientEmailResponse {
  Id: number;
  Email: string;
}

export interface TariffResponse {
  Id: number;
  TerritorialCoverageId: number;
  InsuredSumId: number;
  CoverrageLevelId: number;
  TariffSubgroupId: number;
  IsValid: boolean;
  AgentTypeId: number;
  TariffGroupCode: string;
  TariffCodeCore: string;
  TariffSubgroup: TariffSubgroupResponse;
}

export interface TariffSubgroupResponse {
  Id: number;
  TariffGroupId: number;
  Name: string;
  TariffGroup: TariffGroupResponse;
}

export interface TariffGroupResponse {
  Id: number;
  Name: string;
}

export interface CurrencyResponse {
  Id: number;
  Name: string;
  Symbol: string;
  ISOName: string;
}

export interface ApplicationDiscountResponse {
  Id: number;
  Discount: number;
  StartDate: Date;
  EndDate: Date;
  ApplicationId: number;
  InsertDate: Date;
  Promocode: string;
  DiscountTypeId: number;
  AgentCode: string;
  DiscountType: DiscountTypeResponse;
}

export interface DiscountTypeResponse {
  Id: number;
  Name: string;
}

export interface DestinationResponse {
  id: number;
  name: string;
  nameEng: string;
  nameEngShort: string;
  iso: string;
}

export interface InsuranceCategoryResponse {
  id: number;
  name: string;
}

export interface InsuranceTypeResponse {
  id: number;
  name: string;
}

export interface InsuranceTypePeriodPackageResponse {
  id: number;
  periodDays: number;
  insuranceTypeId: number;
}

export interface PolicyStateResponse {
  id: number;
  name: string;
}
