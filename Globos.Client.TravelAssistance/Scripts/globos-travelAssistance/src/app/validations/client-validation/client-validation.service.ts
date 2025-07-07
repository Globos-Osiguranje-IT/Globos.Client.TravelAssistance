import { Injectable } from '@angular/core';
import moment from 'moment';
import { ValidationResult } from '../validator/models/validation-result.model';
import { TranslateService } from 'ng-globos-core';
import { Validator } from '../validator/validator.service';


@Injectable({
  providedIn: 'root'
})
export class ClientValidationService {
  
  //dodati za strane drzavljane validaciju!

  constructor(private validator: Validator, private translate: TranslateService) { }

  calculateBirthdateFromJMBG(jmbg: string): string | null {
    if (!jmbg || jmbg.length !== 13) return null;

    const day = parseInt(jmbg.substring(0, 2), 10);
    const month = parseInt(jmbg.substring(2, 4), 10) - 1;
    const year = parseInt(jmbg.substring(4, 7), 10) < 800 ?
      2000 + parseInt(jmbg.substring(4, 7), 10) :
      1000 + parseInt(jmbg.substring(4, 7), 10);

    const date = new Date(year, month, day);

    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }

    return moment(date).format('DD.MM.YYYY');
  }

  isValidJMBG(jmbg: string): ValidationResult {
    let validationResult = new ValidationResult();

    if (jmbg.length !== 13 || !/^\d+$/.test(jmbg)) {
      return this.validator.onlyError(this.translate.translate('JMBG ima {0} karaktera, a treba da ima 13', jmbg.length.toString()));
    }

    const birthdate = this.calculateBirthdateFromJMBG(jmbg);

    if (!birthdate)
      return this.validator.onlyError('Nije moguce odrediti datum rodjenja');

    if (!this.validateRepublicCode(jmbg[7]))
      this.validator.addError('Republicki kod neispravan');

    if (!this.validateGenderCode(jmbg.substring(9, 12)))
      this.validator.addError('Neispravan pol');


    if (!this.validateControlNumber(jmbg))
      this.validator.addError('Neispravan kontrolni broj');

    return validationResult;
  }

  private validateRepublicCode(code: string): boolean {
    const validRepublics = ['1', '2', '3', '4', '5', '7', '8', '9'];
    return validRepublics.includes(code);
  }

  private validateGenderCode(code: string): boolean {
    const genderNumber = parseInt(code, 10);
    return (genderNumber >= 0 && genderNumber <= 999);
  }

  private validateControlNumber(jmbg: string): boolean {
    const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(jmbg[i]) * weights[i];
    }

    let controlNum = sum % 11;
    controlNum = controlNum === 0 ? 0 : (controlNum === 1 ? 1 : 11 - controlNum);

    return controlNum === parseInt(jmbg[12]);
  }
  passportNumbersAreUnique(insurantList: any): boolean {
    const counts = new Map<string, number>();
  
    for (const insurant of insurantList) {
      if (!insurant) continue; // ⬅️ ključna linija da ignoriše null/undefined
  
      const passport = (insurant.passportNumber || '').trim();
      if (passport === '') continue; // prazni pasoši se ignorišu
  
      counts.set(passport, (counts.get(passport) || 0) + 1);
      if (counts.get(passport)! > 1) {
        return false; // nađen duplikat
      }
    }
  
    return true;
  }
  

}
