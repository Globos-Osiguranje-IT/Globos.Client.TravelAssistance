import { Injectable } from '@angular/core';
import { ClientSessionModel } from './model/client-session.model';

@Injectable({
  providedIn: 'root'
})
export class ClientSessionService {

  private readonly SESSION_KEY = 'sessionId';
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000;

  public get session(): ClientSessionModel {
    let clientSession = this.getSession();
    if(clientSession.isExpired)
      this.setSession();

    return this.getSession();
  }

  constructor() { }

  private getSession(): ClientSessionModel {
    let plainObj = JSON.parse(this.getSessionAsString());
    return Object.assign(new ClientSessionModel(), plainObj);
  }

  private getSessionAsString(): string {
    return localStorage.getItem(this.SESSION_KEY) || JSON.stringify(new ClientSessionModel());
  }

  private setSession(): void {
    let expiresAt = this.calculateExpiration();
    let sessionAsString = JSON.stringify(new ClientSessionModel(expiresAt));

    localStorage.setItem(this.SESSION_KEY, sessionAsString);
  }

  private calculateExpiration(): number {
    return new Date().getTime() + this.SESSION_DURATION;
  }
}
