export const TagType = {
  Ghost: 'ghost',
  Primary: 'primary'
}

export const Platform = {
  DS: 0,
  PdfTools: 1
}

export const ProductStatus = {
  ComingSoon: 0,
  Available: 1,
}


// airwallex 订单状态
export const ORDER_STATUS = {
  PENDING: 2,
  PAID: 3,
  FAILED: 8
}

export const PRODUCT_TYPE = {
  SUBSCRIPTION: 0,
  PRODUCT: 1
}

// 付款类型
export const PAYMENT_TYPE = {
  COMMON: -1,
  APPLE_IAP: 0,
  GOOGLE_PLAY: 1,
  WECHAT_PAY: 2,
  PAYPAL: 3,
  STRIPE: 4,
  COINBASE: 5,
  AIRWALLEX: 8,
  PAYSSION: 9,
  PAYERMAX: 14,
  FASTSPRING: 15
}