import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; 

import { routes } from './app.routes';
import { PreloadServiceService } from "./http/preload-service.service";

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
              provideRouter(routes), 
              provideHttpClient(withInterceptorsFromDi()), 
              provideAnimations(),
            
              {
                provide: 'APP_INIT',
                useFactory: (loader: PreloadServiceService) => () => loader.preload(),
                deps: [PreloadServiceService],
                multi: true,
              }
            ]
};
