import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClientSessionService } from '../../services/session/client-session.service';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(ClientSessionService);
  const session = sessionService.session;

  if (session) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-Session-Id': session.id
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
