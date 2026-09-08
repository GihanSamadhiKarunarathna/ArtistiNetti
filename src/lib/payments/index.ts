export type CheckoutResult = {
  providerRef: string
  status: "CAPTURED" | "AUTHORIZED" | "PENDING"
}

export interface PaymentProvider {
  createCheckout(input: {
    amountEur: number
    currency: string
    reference: string
  }): Promise<CheckoutResult>
  refund(providerRef: string): Promise<void>
  release(providerRef: string): Promise<void>
}

/**
 * Mock payment provider: immediately "captures" the payment so the full
 * quote-accept flow can be exercised end-to-end without live Stripe/Paytrail/
 * MobilePay credentials. Real adapters implement the same interface and are
 * selected by provider type at the call site, so switching to a live gateway
 * later requires no changes to callers.
 */
class MockPaymentProvider implements PaymentProvider {
  async createCheckout({ amountEur, reference }: { amountEur: number; reference: string }) {
    void amountEur
    return {
      providerRef: `mock_${reference}_${Date.now()}`,
      status: "CAPTURED" as const,
    }
  }

  async refund() {
    // no-op in mock mode
  }

  async release() {
    // no-op in mock mode
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider()
}
