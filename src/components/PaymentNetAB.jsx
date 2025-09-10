/** @format */

import alert from '@components/Toast'
import { useEffect } from 'react'
import cookie from '@utils/cookie'
import CryptoJS from 'crypto-js'
import { getRandomRedirectUrl } from '@utils/redirect'

const ONE_HOUR = 60 * 60 * 1000
const FLAG = 'x-order-id'

export default function PaymentNetAB() {
  // 从ds过来的asiaPay，是用户co复制到浏览器，跳转链接不加密放在了ext参数里。
  // .co域名过来的，是自动跳转，已加密，放在了payUrl参数里。
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    // A站手动拷贝链接过来时，带了ext
    const ext = decryptUrl(params.get('ext'))
    // A站自动跳转过来时，带了payUrl
    const payUrl = params.get('payUrl')
    // 支付完成回来会带上bl，如果bl不是当前域名且有flag，才跳转回A站
    const bl = params.get('bl')

    // 跳转到收银台逻辑
    if (payUrl) {
      // 重定向到收银台
      const decryptedUrl = decryptUrl(payUrl)
      cookie.set(FLAG, Date.now().toString(), ONE_HOUR)
      location.href = decryptedUrl
      return
    } else if (ext) {
      // ds用户手动拷贝链接过来的
      window.location.href = ext
      return
    }

    // 支付完成回来的逻辑
    // 1.需要通过跳板再跳转回A站
    if (bl && cookie.get(FLAG)) {
      const backUrl = decryptUrl(bl)
      // 如果backUrl不是当前域名，才跳转
      if (!urlHostIsCurrent(backUrl)) {
        cookie.del(FLAG)

        const url = new URLSearchParams()
        url.append('url', backUrl)
        location.href = getRandomRedirectUrl(url.toString())
        return
      }
    }

    // 2.不需要跳转回A站
    if (status === 'success') {
      alert.success(
        'Thank you for your payment! Credits have been added to your account. You can check your credit balance in the credit history.',
        undefined,
        1000 * 60 * 60 * 24
      )
    } else if (status === 'cancel') {
      alert.error('Payment failed. Please try again later.', undefined, 100000)
    }
  }, [])
  return null
}

const decryptUrl = (url) => {
  if (url.startsWith('http')) {
    return url
  }
  const key = import.meta.env.PUBLIC_PAYMENT_ENCRYPT_KEY
  const decryptedBytes = CryptoJS.AES.decrypt(window.atob(url), key)
  return decryptedBytes.toString(CryptoJS.enc.Utf8)
}

// 判断url是不是当前域名
const urlHostIsCurrent = (urlString) => {
  // 获取当前页面的host
  const currentHost = window.location.host

  // 解析urlString的host
  const urlHost = new URL(urlString).host

  // 判断两个host是否相同
  const isSameDomain = urlHost === currentHost
  return isSameDomain
}
