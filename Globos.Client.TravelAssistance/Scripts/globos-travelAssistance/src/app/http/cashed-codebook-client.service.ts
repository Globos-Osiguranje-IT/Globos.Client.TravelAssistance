import { Injectable } from '@angular/core';
import { CodebookClientService } from './codebook-client.service';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { City, CodebookResponse, InsuredSumResponse } from './dto/responses/codebook-response.model';
import { LoaderService } from '../services/loader.service';

@Injectable({
  providedIn: 'root'
})
export class CashedCodebookClientService {

  constructor(private codeBookService: CodebookClientService, private loader: LoaderService) { }

  // getCategories(): Observable<CodebookResponse[]> {
  //   const storedData = sessionStorage.getItem("insuranceCategory");

  //   if (storedData) {
  //     return of(JSON.parse(storedData)); // Return stored data as an Observable
  //   } 
  //   else {
  //     return this.codeBookService.getCategories().pipe(
  //       tap(resCat => sessionStorage.setItem("insuranceCategory", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private categories$: Observable<CodebookResponse[]> | null = null;

  getCategories(): Observable<CodebookResponse[]> {
    const storedData = sessionStorage.getItem("insuranceCategory");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }

    if (!this.categories$) {
      this.categories$ = this.codeBookService.getCategories().pipe(
        tap(res => sessionStorage.setItem("insuranceCategory", JSON.stringify(res))),
        tap(() => this.loader.hide()),
        shareReplay(1) // ensures single request and shared result
      );
    }

    this.loader.hide()
    return this.categories$;
  }

  private cityes$: Observable<City[]> | null = null;

  getCity(): Observable<City[]> {
    const storedData = sessionStorage.getItem("cityStorage");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.cityes$) {
      return this.codeBookService.getCity().pipe(
        tap(resCat => sessionStorage.setItem("cityStorage", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.cityes$;
  }

  // getCity(): Observable<City[]> {
  //   const storedData = sessionStorage.getItem("cityStorage");

  //   if (storedData) {
  //     return of(JSON.parse(storedData)); 
  //   } 
  //   else {
  //     return this.codeBookService.getCity().pipe(
  //       tap(resCat => sessionStorage.setItem("cityStorage", JSON.stringify(resCat)))
  //     );
  //   }
  // }


  private travelAgencies$: Observable<CodebookResponse[]> | null = null;

  getTravelAgency(): Observable<CodebookResponse[]> {
    const storedData = sessionStorage.getItem("travelAgencyStorage");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }

    if (!this.travelAgencies$) {
      return this.codeBookService.getTravelAgency().pipe(
        tap(resCat => sessionStorage.setItem("travelAgencyStorage", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.travelAgencies$;
  }

  // getTravelAgency(): Observable<CodebookResponse[]> {
  //   const storedData = sessionStorage.getItem("travelAgencyStorage");
  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   }
  //   else {
  //     return this.codeBookService.getTravelAgency().pipe(
  //       tap(resCat => sessionStorage.setItem("travelAgencyStorage", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private coverageLeves$: Observable<any> | null = null;

  getCoverageLevels() {
    const storedData = sessionStorage.getItem("coverageLevel");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.coverageLeves$) {
      return this.codeBookService.getCoverageLevels().pipe(
        tap(resCat => sessionStorage.setItem("coverageLevel", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.coverageLeves$;
  }

  // getCoverageLevels() {
  //   const storedData = sessionStorage.getItem("coverageLevel");

  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   }
  //   else {
  //     return this.codeBookService.getCoverageLevels().pipe(
  //       tap(resCat => sessionStorage.setItem("coverageLevel", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private insuranceTypes$: Observable<any> | null = null;

  getInsuranceTypes() {
    const storedData = sessionStorage.getItem("insuranceType");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.insuranceTypes$) {
      return this.codeBookService.getInsuranceTypes().pipe(
        tap(resCat => sessionStorage.setItem("insuranceType", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.insuranceTypes$;
  }


  private additionalCoverage$: Observable<any> | null = null;

  getInsurenceAdditionalCoverage() {
    const storedData = sessionStorage.getItem("additionalCoverage");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.additionalCoverage$) {
      return this.codeBookService.getInsurenceAdditionalCoverage().pipe(
        tap(resCat => sessionStorage.setItem("additionalCoverage", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.additionalCoverage$;
  }


  // getInsurenceAdditionalCoverage() {
  //   const storedData = sessionStorage.getItem("additionalCoverage");
  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   }
  //   else {
  //     return this.codeBookService.getInsurenceAdditionalCoverage().pipe(
  //       tap(resCat => sessionStorage.setItem("additionalCoverage", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private contractorTypes$: Observable<CodebookResponse[]> | null = null;

  getContractorType(): Observable<CodebookResponse[]> {
    const storedData = sessionStorage.getItem("contratorType");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.contractorTypes$) {
      return this.codeBookService.getContractorType().pipe(
        tap(resCat => sessionStorage.setItem("contratorType", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.contractorTypes$;
  }

  // getContractorType(): Observable<CodebookResponse[]> {
  //   const storedData = sessionStorage.getItem("contratorType");
  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getContractorType().pipe(
  //       tap(resCat => sessionStorage.setItem("contratorType", JSON.stringify(resCat)))
  //     );
  //   }
  // }


  private tarifGroups$: Observable<any> | null = null;

  getTariffGroups() {
    const storedData = sessionStorage.getItem("tariffGroups");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.tarifGroups$) {
      return this.codeBookService.getTariffGroups().pipe(
        tap(resCat => sessionStorage.setItem("tariffGroups", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.tarifGroups$;
  }

  // getTariffGroups() {
  //   const storedData = sessionStorage.getItem("tariffGroups");

  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getTariffGroups().pipe(
  //       tap(resCat => sessionStorage.setItem("tariffGroups", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private tariffSubGroups$: Observable<any> | null = null;

  getTariffSubGroups() {
    const storedData = sessionStorage.getItem("tariffSubGroup");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.tarifGroups$) {
      return this.codeBookService.getTariffSubGroups().pipe(
        tap(resCat => sessionStorage.setItem("tariffSubGroup", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.tariffSubGroups$;
  }

  // getTariffSubGroups() {
  //   const storedData = sessionStorage.getItem("tariffSubGroup");

  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getTariffSubGroups().pipe(
  //       tap(resCat => sessionStorage.setItem("tariffSubGroup", JSON.stringify(resCat)))
  //     );
  //   }
  // }


  private tariffs$: Observable<any> | null = null;

  getTariff() {
    const storedData = sessionStorage.getItem("tariff")
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }

    if (!this.tariffs$) {
      return this.codeBookService.getTariff().pipe(
        tap(resCat => sessionStorage.setItem("tariff", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.tariffs$;
  }

  // getTariff() {
  //   const storedData = sessionStorage.getItem("tariff")
  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getTariff().pipe(
  //       tap(resCat => sessionStorage.setItem("tariff", JSON.stringify(resCat)))
  //     );
  //   }
  // }


  private teritorialCoverages$: Observable<any> | null = null;

  getTerritorialCoverage() {
    const storedData = sessionStorage.getItem("teritorialCoverage");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.teritorialCoverages$) {
      return this.codeBookService.getTerritorialCoverage().pipe(
        tap(resCat => sessionStorage.setItem("teritorialCoverage", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.teritorialCoverages$;
  }

  // getTerritorialCoverage() {
  //   const storedData = sessionStorage.getItem("teritorialCoverage");
  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getTerritorialCoverage().pipe(
  //       tap(resCat => sessionStorage.setItem("teritorialCoverage", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private destinations$: Observable<any> | null = null;


  getDestination() {
    const storedData = sessionStorage.getItem("destination");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.destinations$) {
      return this.codeBookService.getDestination().pipe(
        tap(resCat => sessionStorage.setItem("destination", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.destinations$;
  }

  // getDestination() {
  //   const storedData = sessionStorage.getItem("destination");

  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getDestination().pipe(
  //       tap(resCat => sessionStorage.setItem("destination", JSON.stringify(resCat)))
  //     );
  //   }
  // }

  private insuredSums$: Observable<InsuredSumResponse[]> | null = null;

  getInsuredSum(): Observable<InsuredSumResponse[]> {
    const storedData = sessionStorage.getItem("insuredSum");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.insuredSums$) {
      return this.codeBookService.getInsuredSum().pipe(
        tap(resCat => sessionStorage.setItem("insuredSum", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.insuredSums$;
  }

  private consents$: Observable<any> | null = null;


  getConsent() {
    const storedData = sessionStorage.getItem("consent");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.consents$) {
      return this.codeBookService.getConsent().pipe(
        tap(resCat => sessionStorage.setItem("consent", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.consents$;
  }

  // getConsent() {
  //   const storedData = sessionStorage.getItem("consent");

  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getConsent().pipe(
  //       tap(resCat => sessionStorage.setItem("consent", JSON.stringify(resCat)))
  //     );
  //   }

  // }

  private insTypePeriodPackages$: Observable<any> | null = null;


  getInsuranceTypePeriodPackages() {
    const storedData = sessionStorage.getItem("insuranceTypePeriodPackages");
    this.loader.show();

    if (storedData) {
      this.loader.hide()
      return of(JSON.parse(storedData));
    }
    if (!this.insTypePeriodPackages$) {
      return this.codeBookService.getInsuranceTypePeriodPackages().pipe(
        tap(resCat => sessionStorage.setItem("insuranceTypePeriodPackages", JSON.stringify(resCat))),
        tap(() => this.loader.hide()),
        shareReplay(1)
      );
    }

    this.loader.hide()
    return this.insTypePeriodPackages$;
  }

  // getInsuranceTypePeriodPackages() {
  //   const storedData = sessionStorage.getItem("insuranceTypePeriodPackages");

  //   if (storedData) {
  //     return of(JSON.parse(storedData));
  //   } else {
  //     return this.codeBookService.getInsuranceTypePeriodPackages().pipe(
  //       tap(resCat => sessionStorage.setItem("insuranceTypePeriodPackages", JSON.stringify(resCat)))
  //     );
  //   }
  // }


}
