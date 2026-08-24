export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  path: string;
  message: string;
}

export interface ValidationSuccess<T> {
  success: true;
  data: T;
  warnings: ValidationIssue[];
}

export interface ValidationFailure {
  success: false;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

