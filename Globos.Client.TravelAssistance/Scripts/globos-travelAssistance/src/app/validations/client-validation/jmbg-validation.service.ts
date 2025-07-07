import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JmbgValidationService {
  getJmbgValidationError(jmbg: string): string | null {

    if (!/^\d{13}$/.test(jmbg)) {
      return `JMBG mora sadržati tačno 13 cifara. Uneto: ${jmbg.length}`;
    }

    const day = parseInt(jmbg.substring(0, 2), 10);
    const month = parseInt(jmbg.substring(2, 4), 10);
    const yearFragment = parseInt(jmbg.substring(4, 7), 10);
    const republicCode = jmbg[7];
    const genderCode = parseInt(jmbg.substring(9, 12), 10);

    let year = yearFragment >= 800 ? 1000 + yearFragment : 2000 + yearFragment;
    if (year > new Date().getFullYear()) {
      year = 1900 + yearFragment;
    }

    const birthdate = new Date(year, month - 1, day);
    if (
      birthdate.getDate() !== day ||
      birthdate.getMonth() + 1 !== month ||
      birthdate.getFullYear() !== year
    ) {
      return 'Datum rođenja je nevažeći u okviru JMBG-a.';
    }

    const validRepublics = ['1', '2', '3', '4', '5', '7', '8', '9'];
    if (!validRepublics.includes(republicCode)) {
      return 'Republički kod nije validan.';
    }

    if (isNaN(genderCode) || genderCode < 0 || genderCode > 999) {
      return 'Kod za pol (pozicije 9-11) nije validan.';
    }

    const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(jmbg[i], 10) * weights[i];
    }

    let controlDigit = sum % 11;
    controlDigit = controlDigit === 0 ? 0 : controlDigit === 1 ? 1 : 11 - controlDigit;

    if (controlDigit !== parseInt(jmbg[12], 10)) {
      return 'Kontrolni broj (poslednja cifra JMBG-a) nije validan.';
    }


    return null;
  }

  getJmbgValidationErrorForeign(jmbg: string): string | null {


    if (!/^\d{13}$/.test(jmbg)) {
      return `JMBG mora sadržati tačno 13 cifara. Uneto: ${jmbg.length}`;
    }

    const segment = jmbg.substring(7, 9);

    if (segment !== '06' && segment !== '66') {
      return 'JMBG mora sadržati "06" ili "66" na 8. i 9. mestu.';
    }


    return null;
  }


  getAdultValidationError(jmbg: string): string | null {

    // izračunaj datum rođenja
    const day = +jmbg.substr(0, 2);
    const mon = +jmbg.substr(2, 2);
    const yfrag = +jmbg.substr(4, 3);
    let year = yfrag >= 800 ? 1000 + yfrag : 2000 + yfrag;
    if (year > new Date().getFullYear()) year = 1900 + yfrag;
    const birthDate = new Date(year, mon - 1, day);
    if (isNaN(birthDate.getTime())) return 'Neispravan datum rođenja u JMBG-u.';

    // provera starosti
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) return 'Ugovarač mora biti stariji od 18 godina.';
    return null;
  }


  
}


