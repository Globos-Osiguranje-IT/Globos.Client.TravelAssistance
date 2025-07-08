import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StepperFeatureComponent } from '../../features/stepper-feature/stepper-feature.component';
import { RouterTrackingService } from '../../services/router-tracking.service';


@Component({
  selector: 'app-policy-main',
  standalone: true,
  imports: [RouterModule, MatStepperModule, FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, StepperFeatureComponent],
  templateUrl: './policy-main.component.html',
  styleUrl: './policy-main.component.scss'
})
export class PolicyMainComponent {

  steps = [
    { title: 'Odaberi paket', subtitle: '', completed: true, route: '/info'},
    { title: 'Podaci', subtitle: '', completed: false, route: '/passanger' },
    { title: 'Pregled', subtitle: '', completed: false, route: '/payment' },
  ]

  constructor(
    private routeService: RouterTrackingService
  ) {}

  ngOnInit(){
    this.routeService.handleRouteOnReload()
  }
}
