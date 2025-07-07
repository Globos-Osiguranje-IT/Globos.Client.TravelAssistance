import { Injectable } from '@angular/core';
import { HttpProxyClientService } from 'ng-globos-core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { InsuranceTypeResponse } from '../http/dto/responses/codebook-response.model';

export interface getRequest {
  Url: string;
  QueryParams: { [key: string]: any };
  Headers: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})

export class InsurnaceTypeService {
  private policyTypeSubject = new BehaviorSubject<InsuranceTypeResponse | null>(null);
  policyType$ = this.policyTypeSubject.asObservable();

  //Observable for start date na jednokratnom osiguranju
  private startDateInsType = new BehaviorSubject<string>("");
  starDate$ = this.startDateInsType.asObservable();

  //Observable for end date na jednokratnom osiguranju
  private endDateInsType = new BehaviorSubject<string>("");
  endDate$ = this.endDateInsType.asObservable();
  
  //Observable for start date na godisnjem osiguranju
  private startDateAnnual = new BehaviorSubject<string>("");
  startDateAnnual$ = this.startDateAnnual.asObservable();

  //Observable for amount u futeru
  private amountSubject = new BehaviorSubject<number | null>(null);
  amount$ = this.amountSubject.asObservable();

  constructor() { }

  setPolicyType(type: InsuranceTypeResponse) {
    this.policyTypeSubject.next(type);
  }

  setStartDate(startDate: string){
    this.startDateInsType.next(startDate);
  }

  setEndDate(endDate: string){
    this.endDateInsType.next(endDate);
  }

  setStartDateAnnual(startDateAnnual: string){
    this.startDateAnnual.next(startDateAnnual);
  }

  setAmount(amount: number | null) {
    this.amountSubject.next(amount);
  }

  ngOnDestroy() : void {
    this.policyTypeSubject.unsubscribe();
    this.startDateInsType.unsubscribe();
    this.endDateInsType.unsubscribe();
    this.startDateAnnual.unsubscribe();
    this.amountSubject.unsubscribe();
  }
}