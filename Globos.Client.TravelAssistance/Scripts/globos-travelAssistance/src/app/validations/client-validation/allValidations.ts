import { AfterViewInit, Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { JmbgValidationService } from './jmbg-validation.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


@Directive({
  selector: '[appLatinOnFocusOut]',
  standalone: true
})
export class AllValidationsDirective implements AfterViewInit {
  private errorElement: HTMLElement | null = null;
  private inputElement: any;

  @Input() selectedValue: any = null;
  @Input() cid: string = '';
  @Input() allJmbgs: string[] = [];
  @Input() contractorJmbg: string = '';
  @Input() insurantJmbg: string = '';
  @Input() items: { label: string; value: any; }[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private jmbgValidator: JmbgValidationService
  ) { }

  ngAfterViewInit(): void {
    if (this.el.nativeElement.nodeName !== 'INPUT') {
      this.inputElement = this.el.nativeElement.querySelector('input');
      if (!this.inputElement) {
        this.inputElement = this.el.nativeElement;
      }
    } else {
      this.inputElement = this.el.nativeElement;
    }

    const cid = this.el.nativeElement.getAttribute('cid') || this.inputElement.getAttribute('cid');
    // console.log('CID inside directive afterViewInit:', cid);
  }

  @HostListener('focusout') onFocusOut(): void {
    const value = this.inputElement.value;


    // console.log('Focus out triggered | value:', value, '| cid:', this.cid);

    if (!value || value.trim() === '') {
      this.showError('Polje je obavezno');
      return;
    }


    if (this.cid.toLowerCase().includes('jmbg')) {
      const fmtErr = this.jmbgValidator.getJmbgValidationError(value);
      if (fmtErr) { this.showError(fmtErr); return; }

    }


    if (this.cid.toLowerCase().includes('jmbg')) {
      const fmtErr = this.jmbgValidator.getJmbgValidationError(value);
      if (fmtErr) { this.showError(fmtErr); return; }

    }


    if (this.cid.toLowerCase().includes('contractor')) {
      const ageErr = this.jmbgValidator.getAdultValidationError(value);
      if (ageErr) { this.showError(ageErr); return; }

      const occurrences = this.allJmbgs.filter(j => j === value).length;

      if (occurrences > 1) {
        this.showError('JMBG je već unet među osiguranike.');
        return;
      }
    }


    // if (this.cid?.toLowerCase().includes('platesnumber')) {
    //   const error = this.getOznakaValidationError(value);
    //   if (error) {
    //     this.showError(error);
    //     return;
    //   } else {
    //     this.removeError();
    //   }
    // }

    if (this.cid?.toLowerCase().includes('production') ) {
      const error = this.productionValidationError(value);
      if (error) {
        this.showError(error);
        return;
      } else {
        this.removeError();
      }
    }



    if (this.cid.toLowerCase().includes('insurant')) {
      const cnt = this.allJmbgs.filter(j => j === value).length;

      if (cnt > 1) {
        this.showError('JMBG već postoji među osiguranicima.');
        return;
      }

      if (this.contractorJmbg === value) {
        this.showError('JMBG ugovarača je već unet.');
        return;
      }
    }

    if (this.cid.toLowerCase().includes('foreign')) {

      if (this.cid === 'contractorforeignCitizen' || this.cid === 'insurantforeignCitizen') {
        const ageErr = this.jmbgValidator.getJmbgValidationErrorForeign(value);
        if (ageErr) { this.showError(ageErr); return; }

      }

    }

    if (this.cid.toLowerCase().includes('datumrodjenja')) {

      let fragment = this.toJmbgDateFragment(value);

      if (this.cid.toLowerCase().includes('contractor')) {

        const ageErr = this.jmbgValidator.getAdultValidationError(fragment);
        if (ageErr) { this.showError(ageErr); return; }

        fragment = fragment + '000000'

        const occurrences = this.allJmbgs.filter(j => j === fragment).length;

        if (occurrences > 1) {
          this.showError('JMBG je već unet među osiguranike.');
          return;
        }
      }

      if (this.cid.toLowerCase().includes('insurant')) {
        fragment = fragment + '000000'


        const cnt = this.allJmbgs.filter(j => j === fragment).length;


        if (cnt > 1) {
          this.showError('JMBG već postoji među osiguranicima.');
          return;
        }

        if (this.contractorJmbg === fragment) {
          this.showError('JMBG ugovarača je već unet.');
          return;
        }
      }

    }



    if (this.cid?.toLowerCase().includes('mobilnog')) {
      const error = this.getMobileValidationError(value);
      if (error) {
        this.showError(error);
        return;
      } else {
        this.removeError();
      }
    }

    if (this.cid?.toLowerCase().includes('email')) {
      const error = this.getEmailValidationError(value);
      if (error) {
        this.showError(error);
        return;
      } else {
        this.removeError();
      }
    }

    if (this.cid?.toLowerCase().includes('chassis')) {
      const error = this.getChassisValidationError(value);
      if (error) {
        this.showError(error);
        return;
      } else {
        this.removeError();
      }
    }


    const control = { value } as AbstractControl;
    const validationResult = this.latinScriptValidator()(control);

    if (validationResult && validationResult['latinRequired']) {
      this.showError('Morate uneti latinicu.');
    } else {
      this.removeError();
    }
  }



  showError(message: string): void {
    if (!this.errorElement) {
      this.errorElement = this.renderer.createElement('div');
      this.renderer.addClass(this.errorElement, 'text-danger');
      this.renderer.addClass(this.errorElement, 'mt-1');
      const text = this.renderer.createText(message);
      this.renderer.appendChild(this.errorElement, text);

      const parent = this.el.nativeElement.parentNode;
      const nextSibling = this.el.nativeElement.nextSibling;
      if (nextSibling) {
        this.renderer.insertBefore(parent, this.errorElement, nextSibling);
      } else {
        this.renderer.appendChild(parent, this.errorElement);
      }
    } else {
      this.errorElement.innerText = message;
    }
  }

  private removeError(): void {
    if (this.errorElement) {
      const parent = this.el.nativeElement.parentNode;
      this.renderer.removeChild(parent, this.errorElement);
      this.errorElement = null;
    }
  }

  latinScriptValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;
      const cyrillicRegex = /^[\u0400-\u04FF\s]+$/;
      return value && cyrillicRegex.test(value)
        ? { latinRequired: true }
        : null;
    };
  }


  private getMobileValidationError(mobile: string): string | null {
    const mobileRegex = /^\+3816\d{6,8}$/;

    if (!mobile) {
      return 'Polje je obavezno';
    }

    if (!mobile.startsWith('+3816')) {
      return 'Broj mora početi sa +3816';
    }

    if (!mobileRegex.test(mobile)) {
      return 'Broj mora imati ukupno 6 do 8 cifara nakon +3816 (npr. +38160123456)';
    }
    return null;
  }

  private getEmailValidationError(email: string): string | null {
    if (!email) {
      return 'Polje je obavezno';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return 'Email adresa nije u ispravnom formatu (primer: ime@domen.com)';
    }

    return null;
  }

  private getChassisValidationError(vin: string): string | null {
    if (!vin) {
      return 'Polje je obavezno';
    }

    if (vin.length !== 17) {
      return 'Broj šasije mora sadržati tačno 17 znakova.';
    }

    // if (!/^[A-Za-z]{2}/.test(vin)) {
    //   return 'Broj šasije mora početi sa dva slova.';
    // }
    // const forbiddenChars = ['I', 'O', 'Q'];
    // for (const char of forbiddenChars) {
    //   if (vin.toUpperCase().includes(char)) {
    //     return `Broj šasije ne sme sadržati slova I, O i Q.`;
    //   }
    // }

    return null;
  }

  public toJmbgDateFragment(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('.');
    const yearNum = parseInt(yyyy, 10);

    const yearFrag = String(yearNum % 1000).padStart(3, '0');

    return dd.padStart(2, '0') + mm.padStart(2, '0') + yearFrag;
  }

  // private getOznakaValidationError(oznakaInput: string): any {
  //   if (!oznakaInput) {
  //     return 'Polje je obavezno';
  //   }
  //   const input = oznakaInput.trim().toUpperCase();

  //   const found = REGISTARSKA_PODRUCJA.some(p =>
  //     input.includes(p.oznaka.toUpperCase())
  //   );

  //   if (!found) {
  //     return 'Uneta tablica nije srpska registarska oznaka.';
  //   }

  // }


  public productionValidationError(productionYear: number): string | null {
     const currentYear = new Date().getFullYear();

    const selectedStartDateJSON = sessionStorage.getItem('selectedStartDate');

    if (selectedStartDateJSON) {
      const selectedStartDate = JSON.parse(selectedStartDateJSON);
      console.log("selectedStartDate", selectedStartDate)

      const year: number = Number(selectedStartDate.substring(0, 4));
      
      console.log("currentYear", year)
      const age = year - productionYear;
      console.log("age", age)
      if (age > 15) {
        return 'Nije moguće osigurati vozilo starije od 15 godina';
      }

    }else{
      return 'Morate uneti datum početka osiguranja';
    }

    if (!/^\d{4}$/.test(productionYear.toString())) {
      return 'Godina proizvodnje mora imati tačno 4 cifre';
    }
    if (  productionYear > currentYear) {
      return 'Uneli ste datum u budućnosti';
    }

    return null;
  }



}
