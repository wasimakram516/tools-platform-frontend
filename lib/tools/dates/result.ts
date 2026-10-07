export interface CalculationFailure {
  ok: false;
  message: string;
}

/**
 * Builds the failure shape every calculator returns, so the UI handles all of them the same way.
 */
export function failure(message: string): CalculationFailure {
  return { message, ok: false };
}
