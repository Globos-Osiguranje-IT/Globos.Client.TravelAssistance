import { Injectable,EventEmitter } from "@angular/core";
import { ValidationResult } from "./models/validation-result.model";
import { TranslateService } from 'ng-globos-core';
export const globalValidationEmitter = new EventEmitter<(result: boolean) => void>();
@Injectable({
  providedIn: 'any'
})
export class Validator {

  private result: ValidationResult = new ValidationResult();

  constructor(private translateSvc: TranslateService) { }

  public get isSuccess(): boolean {
    return this.result.isSuccess;
  }

  public get isFailed(): boolean {
    return !this.result.isSuccess;
  }

  public addError(message: string): Validator {
    let translated = this.translateSvc.translate(message)
    this.result.addError(translated);
    return this;
  }

  public onlyError(message: string): ValidationResult {
    this.addError(message);

    return this.getResult();
  }

  public getResult(): ValidationResult {
    return this.result;
  }

  public clear(): void {
    this.result.reset();
  }
}
