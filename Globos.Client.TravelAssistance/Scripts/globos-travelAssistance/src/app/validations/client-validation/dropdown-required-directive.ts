import { AfterViewInit, Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDropdownRequired]',
  standalone: true
})
export class DropdownRequiredDirective implements AfterViewInit {
  private errorElement: HTMLElement | null = null;
  private dropdownElement: HTMLSelectElement | HTMLInputElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.dropdownElement = this.el.nativeElement.querySelector('select') || this.el.nativeElement.querySelector('input');
  }

  @HostListener('focusout') onFocusOut(): void {
    this.triggerValidation();
  }

  public triggerValidation(): void {
    const value = this.dropdownElement?.value;
    if (!value || value.trim() === '') {
      this.showError('Polje je obavezno');
    } else {
      this.removeError();
    }
  }

  private showError(message: string): void {
    if (!this.errorElement) {
      this.errorElement = this.renderer.createElement('div');
      this.renderer.addClass(this.errorElement, 'text-danger');
      this.renderer.addClass(this.errorElement, 'mt-1');
      this.renderer.setStyle(this.errorElement, 'font-size', '0.875rem');

      const text = this.renderer.createText(message);
      this.renderer.appendChild(this.errorElement, text);

      this.renderer.appendChild(this.el.nativeElement, this.errorElement);
    }
  }

  private removeError(): void {
    if (this.errorElement) {
      this.renderer.removeChild(this.el.nativeElement, this.errorElement);
      this.errorElement = null;
    }
  }
}
