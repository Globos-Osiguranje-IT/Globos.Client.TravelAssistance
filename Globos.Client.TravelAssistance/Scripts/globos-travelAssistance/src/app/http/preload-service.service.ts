import { Injectable } from '@angular/core';
import { CodebookClientService } from './codebook-client.service';
import { forkJoin, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreloadServiceService {

  constructor(private codeBookService: CodebookClientService) { }

  preload(): Observable<void> {
    const preloadMap = [
      { key: 'insuranceCategory', loader: () => this.codeBookService.getCategories() },
      { key: 'cityStorage', loader: () => this.codeBookService.getCity() },
      { key: 'travelAgencyStorage', loader: () => this.codeBookService.getTravelAgency() },
      { key: 'coverageLevel', loader: () => this.codeBookService.getCoverageLevels() },
      { key: 'insuranceType', loader: () => this.codeBookService.getInsuranceTypes() },
      { key: 'additionalCoverage', loader: () => this.codeBookService.getAdditionalCoverages() },
      { key: 'contratorType', loader: () => this.codeBookService.getContractorType() },
      { key: 'tariffGroups', loader: () => this.codeBookService.getTariffGroups() },
      { key: 'tariffSubGroup', loader: () => this.codeBookService.getTariffSubGroups() },
      { key: 'tariff', loader: () => this.codeBookService.getTariff() },
      { key: 'teritorialCoverage', loader: () => this.codeBookService.getTerritorialCoverage() },
      { key: 'destination', loader: () => this.codeBookService.getDestination() },
      { key: 'insuredSum', loader: () => this.codeBookService.getInsuredSum() },
      { key: 'consent', loader: () => this.codeBookService.getConsent() },
      { key: 'insuranceTypePeriodPackages', loader: () => this.codeBookService.getInsuranceTypePeriodPackages() },
      // add more as needed
    ];
  
    const calls = preloadMap.map(entry => {
      if (!sessionStorage.getItem(entry.key)) {
        return entry.loader().pipe(
          tap(data => sessionStorage.setItem(entry.key, JSON.stringify(data)))
        );
      }
      return of(null);
    });
  
    return forkJoin(calls).pipe(map(() => void 0));
  }
  
}
