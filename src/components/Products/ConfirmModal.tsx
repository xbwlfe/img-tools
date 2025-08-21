import { useRef, useState } from 'react'


import { Platform } from './enums'
import { btn } from './style'

const ConfirmModal = ({ product, ordering, onClose, onConfirm, onChange }) => {
  const isH5 = false
  const [value, setValue] = useState('')

  const inputRef = useRef(null)
  return (
    <div className="modal-center modal modal-open bg-black/60">
      <div className="modal-box relative rounded-2.5xl bg-[#323f52] py-8 px-5 xl:max-w-[560px] xl:p-10">
        <h1 className="text-lg font-semibold text-white xl:text-xl">Confirm purchase</h1>
        <div className="py-4 xl:py-6">
          <table className="w-full text-white/60 xl:text-base">
            <colgroup>
              <col style={{ width: '32%' }} />
              <col style={{ width: '68%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="py-2.5 text-left">Package</td>
                <td className="py-2.5 text-right text-white">{product?.name}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-left">Price</td>
                <td className="py-2.5 text-right text-white">{product?.price}</td>
              </tr>
              {product?.platform === Platform.DS && (
                <>
                  <tr>
                    <td className="hidden text-left xl:table-cell xl:py-2.5">
                      Account ID <br />
                      (optional)
                    </td>
                    <td className="pt-2.5 pb-1 text-left xl:hidden xl:py-2.5" colSpan={2}>
                      Account ID (optional)
                    </td>
                    <td className="hidden text-right xl:table-cell xl:py-2.5">
                      <input
                        ref={isH5 ? null : inputRef}
                        value={value}
                        onChange={(e) => {
                          inputRef.current.setCustomValidity('')
                          setValue(e.target.value.trim())
                          onChange(e.target.value.trim())
                        }}
                        type="text"
                        pattern="[0-9]{19}" // HTML5 验证模式
                        placeholder="Paste your Account ID from DS PRO"
                        className="input w-full border-white/12 bg-transparent text-white xl:rounded-xl"
                        maxLength={19}
                      />
                    </td>
                  </tr>
                  <tr className="xl:hidden">
                    <td colSpan={2} className="pt-1 pb-2.5">
                      <input
                        ref={isH5 ? inputRef : null}
                        value={value}
                        onChange={(e) => {
                          inputRef.current.setCustomValidity('')
                          setValue(e.target.value.trim())
                          onChange(e.target.value.trim())
                        }}
                        type="text"
                        pattern="[0-9]{19}" // HTML5 验证模式
                        inputMode="numeric" // 在移动设备上显示数字键盘
                        placeholder="Paste your Account ID from DS PRO"
                        className="input w-full border-white/12 bg-transparent text-white xl:rounded-xl"
                        maxLength={19}
                      />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        {product?.platform === Platform.DS && (
          <p className="text-sm text-white/60 xl:text-base">
            · If a user ID is provided, the credits will be directly added to the user ID.
            <br />· If no user ID is provided, a redemption code will be sent, which must be
            redeemed manually in DS PRO.
          </p>
        )}
        <div className="modal-action mt-6 xl:mt-8">
          <button
            className={`${btn} flex !h-12 w-full items-center justify-center !leading-12 text-white`}
            onClick={
              ordering
                ? null
                : () => {
                    if (
                      product?.platform !== Platform.DS ||
                      inputRef.current.checkValidity()
                    ) {
                      onConfirm()
                    } else {
                      inputRef.current.setCustomValidity(
                        'Please enter a valid 19-digit Account ID (numbers only)'
                      )
                      inputRef.current.reportValidity()
                    }
                  }
            }
          >
            Next
          </button>
        </div>
        <label className="btn btn-circle btn-sm absolute right-2 top-2" onClick={onClose}>
          ✕
        </label>
      </div>
    </div>
  )
}

export default ConfirmModal
