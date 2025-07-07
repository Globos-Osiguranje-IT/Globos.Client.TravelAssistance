import { ValidationError } from "./validation-error.model";

export class ValidationResult {
  public errors: ValidationError[] = [];

  public get isSuccess(): boolean {
    return this.errors.length === 0;
  }

  public get isFail(): boolean {
    return !this.isSuccess;
  }

  public addError(message: string): void {
    let errorResult = this.asError(message);
    this.errors.push(errorResult);
  }

  public reset(): void {
    this.errors = [];
  }

  private asError(message: string): ValidationError {
    return { message: message}
  }
}