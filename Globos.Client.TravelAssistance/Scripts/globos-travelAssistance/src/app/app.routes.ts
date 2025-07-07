import { Routes } from '@angular/router';

export const routes: Routes = [

    { path: '', redirectTo: '/putno-osiguranje', pathMatch: 'full' },
    {
        path: 'putno-osiguranje',
        loadComponent: () => import('./pages/travel/policy-main.component').then(m => m.PolicyMainComponent),
        children: [
            {
                path: '', redirectTo: 'info', pathMatch: 'full'
            },
            {
                path: 'info',
                loadComponent: () => import('./pages/travel/info/travel-info-page.component').then(m => m.TravelInfoPageComponent)
            },
            {
                path: 'passanger',
                loadComponent: () => import('./pages/travel/passangers/passangers-page.component').then(m => m.PassangersPageComponent)
            },
            {
                path: 'payment',
                loadComponent: () => import('./pages/travel/payments/payments-page.component').then(m => m.PaymentsPageComponent)
            }
        ]
    },
    {
        path: 'payment-result',
        loadComponent: () => import('./pages/travel/payment-result/payment-result-page.component').then(m => m.PaymentResultPageComponent)
    }
];
