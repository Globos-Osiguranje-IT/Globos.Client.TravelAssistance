import { Helper } from "../../../utils/helper.util";

export class ClientSessionModel {
  id: string = Helper.generateGuid();
  expiresAtUnix: number = 0;

  constructor(expiresAtUnix: number = 0) { this.expiresAtUnix = expiresAtUnix }

  public get isExpired(): boolean {
    return this.expiresAtUnix <= new Date().getTime();
  }
}
