import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterTrackingService {

  constructor(
    private router: Router) { }

  private stepperRoutes = ['/info', '/passanger', '/payment'];

  handleRouteOnReload() {
    this.cleanTrackingParamsFromUrl();

    let path = this.getRoutePath();
    if (this.stepperRoutes.includes("/" + path)) {
      this.router.navigate(['']);
    }
    sessionStorage.clear();
  }

  private getRoutePath(): string {
    const currentUrl = this.router.url;
    var indexOfLastSlahs = currentUrl.lastIndexOf('/');
    return this.router.url.substring(indexOfLastSlahs + 1);
  }

  private cleanTrackingParamsFromUrl(): void {
    const url = window.location.href;
    const hasGlParams = url.includes('_gl=');

    if (hasGlParams) {
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}
