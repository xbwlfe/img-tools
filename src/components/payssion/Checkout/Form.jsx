/** @format */

import { useEffect, useRef } from 'react'

import { useMemoizedFn } from 'ahooks'

import website from '../../../configs/website.json'
import InputField from './InputField'
import { FORM_FIELDS, PRODUCT_TYPE, supportedCurrencies } from './enums'
import { useDispatch, useStore } from './store'
import useHandlers from './useHandlers'
import { Spin } from 'antd'
import { validators } from './validators'

const CreditCardForm = ({ cdnHost = website.cdn_host, product, payment }) => {
	const { createOrderWithAddress } = useHandlers()
	const store = useStore()
	const dispatch = useDispatch()
	const { countries, form, ordering, errorDes } = store

	const { value: selectedCountry } = form.country_name
	const stateRef = useRef(null)
	const formRef = useRef(null)
	const countryNames = countries
		.filter(i => supportedCurrencies.includes(i.iso2.toLowerCase()))
		.map(country => country.name)
	const states = (selectedCountry && countries.find(i => i.name === selectedCountry)?.states) || []
	const stateNames = states.map(i => i.name)
	const submit = useMemoizedFn(e => {
		e.preventDefault()
		let state_code = '',
			country_code = '',
			is_state_optional = false
		const country = countries.find(i => i.name === selectedCountry)
		if (country) {
			country_code = country.iso2
			if (country.states.length === 0) {
				is_state_optional = true
				state_code = '-'
			} else {
				const state = country.states.find(i => i.name === form.state_name.value)
				if (state) {
					state_code = state.name
				}
			}
		}
		const params = { state_code, country_code }
		const errors = []

		FORM_FIELDS.forEach(name => {
			if (name === 'prefix') {
				params[name] = form[name].value || '+1'
				return
			}
			/**
			 * 只有 state_code 可选，仅当没有 states 时
			 */
			if (name === 'state_name' && is_state_optional) {
				return
			}

			const event = new Event('input', { bubbles: true })
			e.target[name]?.dispatchEvent?.(event)

			if ((!form[name].value || form[name].errorMsg) && name !== 'address_line2') {
				errors.push(name)
			} else {
				params[name] = form[name].value
			}
		})
		params.card_number = params.card_number?.replace(/\s/g, '')
		delete params.state_name
		delete params.country_name
		if (errors.length > 0) {
			console.log('errors', errors, params)
		} else {
			createOrderWithAddress(params, product, payment)
		}
	})

	useEffect(() => {
		const country = countries.find(i => i.name === selectedCountry)
		if (country) {
			dispatch({
				type: 'SELECT_COUNTRY',
				payload: country.name,
			})
		} else {
			dispatch({
				type: 'SELECT_COUNTRY',
				payload: '',
			})
		}
		stateRef.current.value = ''
	}, [selectedCountry, dispatch, countries])

	useEffect(() => {
		async function load() {
			const response = await fetch(cdnHost + '/countries%2Bstates.json')
			dispatch({
				type: 'SET_COUNTRIES',
				payload: await response.json(),
			})
		}

		load()
	}, [cdnHost, dispatch])

	return (
		<div className='checkout-form'>
			<form className='space-y-2 lg:space-y-3' onSubmit={submit} noValidate ref={formRef}>
				<div className='flex space-x-2 xl:space-x-2'>
					<InputField
						placeholder='First Name'
						validator={val => validators.notEmpty(val)}
						name='first_name'
						maxLength='50'
						required
						disabled={ordering}
					/>
					<InputField
						placeholder='Last Name'
						validator={val => validators.notEmpty(val)}
						name='last_name'
						maxLength='50'
						required
						disabled={ordering}
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<div className='flex-1'>
						<InputField
							name='country_name'
							placeholder='Country'
							list='countries'
							datalist={countryNames}
							validator={val => validators.option(val, countryNames)}
							required
							disabled={ordering}
						/>
					</div>
					<div className='flex-1'>
						<InputField
							name='state_name'
							placeholder='State/ Province'
							list='states'
							validator={val => (stateNames.length > 0 ? validators.option(val, stateNames) : '')}
							datalist={stateNames}
							ref={stateRef}
							disabled={ordering}
						/>
					</div>
					<div className='hidden w-full lg:mt-0 lg:block lg:flex-1'>
						<InputField
							name='city'
							placeholder='City'
							validator={val => validators.notEmpty(val)}
							disabled={ordering}
							maxLength={80}
							required
						/>
					</div>
				</div>
				{/* 移动端 */}
				<div className='flex space-x-2 lg:hidden xl:space-x-2'>
					<div className='flex-1'>
						<InputField
							name='city'
							placeholder='City'
							validator={val => validators.notEmpty(val)}
							maxLength={80}
							disabled={ordering}
							required
						/>
					</div>
					<div className='flex-1'>
						<InputField
							placeholder='ostal Code'
							type='text'
							name='postal_code'
							validator={val => validators.reg(val, /^[\d a-zA-Z-]+$/g)}
							required
							maxLength='32'
							disabled={ordering}
						/>
					</div>
				</div>
				<div className='flex lg:space-x-2'>
					<div className='hidden flex-1 lg:block'>
						<InputField
							placeholder='ostal Code'
							type='text'
							name='postal_code'
							validator={val => validators.reg(val, /^[\d a-zA-Z-]+$/g)}
							required
							maxLength='32'
							disabled={ordering}
						/>
					</div>
				</div>
				<div className='flex'>
					<InputField
						name='address_line1'
						placeholder={'Billing Address' + 1}
						validator={val => validators.notEmpty(val)}
						disabled={ordering}
						maxLength={200}
						required
					/>
				</div>
				<div className='flex'>
					<InputField
						name='address_line2'
						placeholder={'Billing Address' + 2}
						maxLength={200}
						disabled={ordering}
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<div className='w-full lg:flex-1'>
						<InputField
							name='email'
							placeholder='Email Address'
							validator={val => validators.email(val)}
							maxLength={50}
							disabled={ordering}
							required
						/>
					</div>
					<div className='w-full lg:flex-1'>
						<InputField
							name='phone'
							type='tel'
							placeholder='Phone Number'
							validator={val => validators.notEmpty(val)}
							maxLength={30}
							disabled={ordering}
							required
						/>
					</div>
				</div>
				<div className='text-xs text-error'>{errorDes}</div>
				<button
					type={ordering ? 'button' : 'submit'}
					className='mt-6 inline-flex w-full items-center justify-center gap-1 rounded-3xl border-0 bg-black p-3 font-bold text-[rgba(255,255,255,0.96)] focus:border-0 focus:outline-none'
				>
					{ordering ? <Spin /> : 'Confirm'}
				</button>
				<p className='text-xs font-light text-black-95'>
					By continuing, I agree to the{' '}
					<a
						target='_blank'
						href='https://www.klarna.com/international/terms-and-conditions/'
						className='cursor-pointer text-[#6700b6]'
						rel='noreferrer'
					>
						Klarna&apos;s User Terms
					</a>{' '}
					·{' '}
					<a
						target='_blank'
						href='https://www.klarna.com/international/privacy-policy/'
						className='cursor-pointer text-[#6700b6]'
						rel='noreferrer'
					>
						Privacy notice
					</a>
				</p>
			</form>
			{product?.productType === PRODUCT_TYPE.SUBSCRIPTION && (
				<p className='mt-3 text-xs text-[rgba(255,255,255,0.48)]'>
					This payment method does NOT automatically renew and is only available for a one-time
					payment.
				</p>
			)}

			<style jsx>{`
				.checkout-form :global(input:-webkit-autofill),
				.checkout-form :global(input:-webkit-autofill:hover),
				.checkout-form :global(input:-webkit-autofill:focus),
				.checkout-form :global(input:-webkit-autofill:active) {
					color: rgba(255, 255, 255, 0.8) !important;
					-webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.13) inset !important;
					-webkit-background-clip: text !important;
					background-clip: text !important;
				}
			`}</style>
		</div>
	)
}

export default function Form({ product, payment }) {
	const { productTypeDes, price, discount, name, currency } = product
	return (
		<div className='mx-auto rounded-lg pt-2 xl:max-w-[640px]'>
			<Logo />
			<div className='mt-3 flex items-center justify-between text-[14px] text-black-95'>
				<span>
					{productTypeDes}&nbsp;•&nbsp;{name}
				</span>
				<span>
					{currency}
					{discount?.price ?? price}
				</span>
			</div>
			<div className='-mx-4 my-4 h-[1px] bg-black-12 xl:-mx-6 xl:mb-[18px]'></div>
			<CreditCardForm product={product} payment={payment} />
		</div>
	)
}

const Logo = () => (
	<svg width='96' height='24' viewBox='0 0 96 24' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M83.338 23.58a8.05 8.05 0 0 1-4.301-3.348 8.94 8.94 0 0 1 .571-10.512c2.256-2.734 6.533-4.202 10.764-1.637v-.871h4.9v16.38h-4.9v-.965c-1.447.905-2.94 1.373-4.478 1.373a8.2 8.2 0 0 1-2.556-.42zm2.872-12.336c-2.31.02-4.183 1.894-4.154 4.162.029 2.263 1.94 4.116 4.231 4.101a4.2 4.2 0 0 0 4.085-3.439v-1.392a4.14 4.14 0 0 0-4.128-3.432h-.034zm-51.384 12.54a8.078 8.078 0 0 1-5.212-3.83 8.911 8.911 0 0 1 .72-10.2C32.99 6.542 36.562 5.98 41.17 8.076l.052-.62v-.24h4.901v16.376h-4.9v-.307l-.044-.682c-1.457.893-2.966 1.392-4.55 1.392a7.763 7.763 0 0 1-1.805-.213l.002.002zm-1.996-8.472a4.16 4.16 0 0 0 4.116 4.198c2.284.028 4.214-1.824 4.243-4.083.029-2.28-1.817-4.145-4.135-4.176h-.063c-2.301 0-4.133 1.783-4.161 4.063v-.002zm-11.21 8.28V0h4.9v23.592h-4.9zm-21.62 0V0h5.333v23.592H0zm13.67-.038s-5.22-7.419-7.694-10.95a1.248 1.248 0 0 1-.072-.266c4.349-2.796 7.116-6.7 7.224-12.319h5.112a18.92 18.92 0 0 1-1.342 7.21 19.214 19.214 0 0 1-3.9 6.115l7.172 10.21h-6.5zm46.198-.058V7.241h4.687v1.675c1.135-1.34 2.407-1.946 3.881-2.12 3.3-.383 6.696 1.311 7.45 4.945.096.49.146.989.144 1.488.014 3.254.007 6.506.004 9.76 0 .145-.024.291-.045.497h-4.683c0-2.496.008-4.92-.004-7.346.01-.7-.025-1.4-.104-2.095-.23-1.738-1.284-2.681-2.983-2.736-1.761-.058-3.153.984-3.468 2.62-.077.418-.113.84-.11 1.268-.01 2.477-.005 4.953-.005 7.43v.869h-4.764zm-11.544-.007-.002-16.27h4.84v1.932c1.359-1.332 2.808-1.968 4.553-1.944v4.536c-1.06.449-2.057.744-2.928 1.272-1.08.653-1.608 1.728-1.596 3.077.024 2.18.005 4.356.007 6.535v.862h-4.876.002z'
			fill='#000'
			fill-rule='nonzero'
			opacity='.4'
		/>
	</svg>
)
