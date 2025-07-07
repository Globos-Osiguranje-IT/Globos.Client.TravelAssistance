import { Injectable } from '@angular/core';
import { HttpProxyClientService } from 'ng-globos-core';
import { Observable, map } from 'rxjs';
import { City, CodebookResponse, InsuranceAdditionalCoverageResponse, InsuranceTypePeriodPackageResponse, InsuredSumResponse, DestinationTerritorialCoverage } from './dto/responses/codebook-response.model';
import { InsuranceCategoryResponse } from './dto/responses/codebook-response.model';
import { GetRequest } from 'ng-globos-core';
@Injectable({
  providedIn: 'root'
})
export class CodebookClientService {

  constructor(private proxy: HttpProxyClientService) { }

  getCategories(): Observable<CodebookResponse[]> {
    let getRequestCategory: GetRequest = {
      Url: '/InsuranceCategory',
      Headers: {},
      QueryParams: {},
    };

    return this.proxy.get('/travel/getRequest/', getRequestCategory).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getCity(): Observable<City[]> {
    let getCity: GetRequest = {
      Url: '/City',
      Headers: {},
      QueryParams: {},
    };

    return this.proxy.get('/travel/getRequest/', getCity).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getTravelAgency(): Observable<CodebookResponse[]> {
    let getTravelAgency: GetRequest = {
      Url: '/TravelAgency',
      Headers: {},
      QueryParams: {},
    };

    return this.proxy.get('/travel/getRequest/', getTravelAgency).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getInsuranceTypes(): Observable<[InsuranceCategoryResponse[]]> {
    let getRequestInsuranceType: GetRequest = {
      Url: "/InsuranceType",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequestInsuranceType).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getCoverageLevels(): Observable<CodebookResponse[]> {
    let getRequestCoverageLevel: GetRequest = {
      Url: '/CoverrageLevel',
      Headers: {},
      QueryParams: {},
    };

    return this.proxy.get('/travel/getRequest/', getRequestCoverageLevel).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getInsurenceAdditionalCoverage(): Observable<InsuranceAdditionalCoverageResponse[]> {
    let getRequestAdditionalCoverage: GetRequest = {
      Url: "/InsuranceAdditionalCoverage",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequestAdditionalCoverage).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getContractorType(): Observable<CodebookResponse[]> {
    let getRequest: GetRequest = {
      Url: "/ClientType",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getAdditionalCoverages(): Observable<InsuranceAdditionalCoverageResponse[]> {
    let getRequest: GetRequest = {
      Url: "/InsuranceAdditionalCoverage",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getTariffGroups() {
    let getRequest: GetRequest = {
      Url: "/TariffGroup",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getTariffSubGroups() {
    let getRequest: GetRequest = {
      Url: "/TariffSubgroup",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getTariff() {
    let getRequest: GetRequest = {
      Url: "/ComplexCodebook/GetAllTariff",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getTerritorialCoverage() {
    let getRequest: GetRequest = {
      Url: "/TerritorialCoverage",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getDestination() {
    let getRequest: GetRequest = {
      Url: "/Destination",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getInsuredSum(): Observable<InsuredSumResponse[]> {
    let getRequest: GetRequest = {
      Url: "/ComplexCodebook/GetAllInsuredSum",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    );
  }

  getConsent() {
    let getRequest: GetRequest = {
      Url: "/Consent",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    )
  }

  getInsuranceTypePeriodPackages(): Observable<InsuranceTypePeriodPackageResponse[]> {
    let getRequest: GetRequest = {
      Url: "/ComplexCodebook/GetAllInsuranceTypePeriodPackages",
      Headers: {},
      QueryParams: {}
    };

    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    )
  }

  getDestinationTerritorialCoverage(): Observable<DestinationTerritorialCoverage[]> {
    let getRequest: GetRequest = {
      Url: "/ComplexCodebook/GetDestinationTerritorialCoverage",
      Headers: {},
      QueryParams: {}
    };
    
    return this.proxy.get('/travel/getRequest/', getRequest).pipe(
      map((response: any) => {
        return response?.response ?? [];
      })
    )
  }
}