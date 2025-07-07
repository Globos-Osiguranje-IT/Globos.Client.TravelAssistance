import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet,NavigationEnd,RouterEvent } from '@angular/router';
import { Icons } from '../../enums';
import { LoaderService } from '../../services/loader.service';
import { InsurnaceTypeService } from '../../services/insurnace-type.service';
import { AdditionalInsuranceClientResponse } from '../insurance-additionals/model/insuranceAdditionals.model';
import { PolicyClientService } from '../../http/policy-client.service';
import { filter, Subscription } from 'rxjs';
import { TravelInfoPageComponent } from '../../pages/travel/info/travel-info-page.component';
import { globalValidationEmitter } from '../../validations/validator/validator.service';

interface Step {
  title: string;
  subtitle: string;
  completed: boolean;
  route: string;
}

@Component({
  selector: 'gbs-stepper-feature',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
  templateUrl: './stepper-feature.component.html',
  styleUrl: './stepper-feature.component.scss'
})

export class StepperFeatureComponent {
  @Input() steps: Step[] = [];
  currentStepIndex: number = 0;
  private routerSubscription!: Subscription;

  iconCheck: Icons = Icons.Check;

  constructor(private router: Router,
              private loaderService: LoaderService,
              private insTypeService: InsurnaceTypeService,
              private policyClientService: PolicyClientService
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url.split('/').pop();
        const index = this.steps.findIndex(s => s.route.replace('/', '') === currentRoute);
        if (index !== -1) {
          this.currentStepIndex = index;
          this.steps.forEach((step, i) => {
            step.completed = i <= index;
          });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  navigateToStep(stepRoute: string, targetIndex: number): void {
    if (this.currentStepIndex === 0 && targetIndex === 2) {
      console.warn('Direktan prelazak sa Info na Payment nije dozvoljen.');
      return;
    }

    if (this.currentStepIndex === 0 && targetIndex === 1) {
      if (!this.sessionValidForStep1()) {
        console.warn('Nedostaje jedan od objekata: step1RequestObject ili selectedOffer.');
        return;
      }
      if (!this.runAllValidations()) {
        console.warn('Validacije nisu pro�le.');
        return;
      }
    }

    if (this.currentStepIndex === 1 && targetIndex === 2) {
      if (!this.sessionValidForStep2()) {
        console.warn('Nedostaje jedan od objekata: step1RequestObject, selectedOffer ili policySaveRequest.');
        return;
      }
    }

    this.navigateTo(stepRoute);
  }

  private sessionValidForStep1(): boolean {
    const step1RequestObject = sessionStorage.getItem('step1RequestObject');
    const selectedOffer = sessionStorage.getItem('selectedOffer');
    return step1RequestObject !== null && selectedOffer !== null;
  }

  private sessionValidForStep2(): boolean {
    const step1RequestObject = sessionStorage.getItem('step1RequestObject');
    const selectedOffer = sessionStorage.getItem('selectedOffer');
    const policySaveRequest = sessionStorage.getItem('policySaveRequest');
    return step1RequestObject !== null && selectedOffer !== null && policySaveRequest !== null;
  }
  
  private runAllValidations(): boolean {
    let result = false;
  
    globalValidationEmitter.emit((isValid: boolean) => {
      result = isValid;
    });
  
    return result;
  }
  
  private navigateTo(stepRoute: string): void {
    const sanitizedRoute = stepRoute.startsWith('/') ? stepRoute.slice(1) : stepRoute;
    this.router.navigate(['putno-osiguranje', sanitizedRoute]);

    // console.log('Navigating to step:', sanitizedRoute);
    
  
    this.makeRequest();
  }

  makeRequest() {
    this.loaderService.show();

    setTimeout(() => {
      this.loaderService.hide();
    }, 1000); 
  }
}
