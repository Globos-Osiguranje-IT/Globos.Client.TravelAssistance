import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appLettersOnly]',
  standalone: true
})
export class LettersOnlyDirective {
  /** Dozvoljava samo slova A–Ž (i backspace, tab, delete, strelice) */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    // kontrolni tasteri
    if (
      key === 'Backspace' ||
      key === 'Tab' ||
      key === 'Delete' ||
      key === ' ' ||
      key.startsWith('Arrow')
    ) {
      return;
    }
    // slova (uključujući š, đ, č, ć, ž)
    if (!/^[A-Za-zŠĐČĆŽšđčćž]$/.test(key)) {
      event.preventDefault();
    }
  }
}
