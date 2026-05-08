export interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalCaptureResponse {
  id: string
  status: 'COMPLETED' | 'VOIDED' | 'PARTIALLY_REFUNDED'
  purchase_units: Array<{
    payments: {
      captures: Array<{ id: string; status: string; amount: { value: string; currency_code: string } }>
    }
  }>
}
