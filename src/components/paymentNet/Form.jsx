/** @format */

import { useEffect, useRef } from 'react'

import { useMemoizedFn } from 'ahooks'

import website from '@configs/website.json'

import InputField from './InputField'
import { FORM_FIELDS } from './enums'
import { useDispatch, useStore } from './store'
import useHandlers from './useHandlers'
import { validators } from './validators'

import Loading from './Loading'

const CreditCardForm = ({ cdnHost = website.cdn_host, product }) => {
	const { createOrder } = useHandlers()
	const store = useStore()
	const dispatch = useDispatch()
	const { countries, form, ordering, errorDes } = store

	const { value: selectedCountry } = form.country_name
	const stateRef = useRef(null)
	const formRef = useRef(null)
	const countryNames = countries.map(country => country.name)
	const states = (selectedCountry && countries.find(i => i.name === selectedCountry)?.states) || []
	const stateNames = states.map(i => i.name)
	const submit = useMemoizedFn(e => {
		e.preventDefault()
		const form = e.target
		// 触发所有表单元素的校验
		const isValid = form.checkValidity()
		// 显示校验信息
		form.reportValidity()
		if (!isValid) return
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
			/**
			 * 只有 state_code 可选，仅当没有 states 时
			 */
			// if (name === 'state_name' && is_state_optional) {
			// 	return
			// }
			const event = new Event('input', { bubbles: true })
			e.target[name]?.dispatchEvent?.(event)

			params[name] = form[name].value
		})
		params.card_number = params.card_number?.replace(/\s/g, '')
		delete params.state_name
		delete params.country_name
		if (errors.length > 0) {
			console.log('errors', errors, params)
		} else {
			if (!params.email || !params.phone) return
			createOrder(params, product)
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
				<div className='flex space-x-2 xl:space-x-3'>
					<InputField
						placeholder='First Name on Card'
						validator={val => validators.notEmpty(val)}
						name='first_name'
						maxLength='50'
						disabled={ordering}
					/>
					<InputField
						placeholder='Last Name on Card'
						validator={val => validators.notEmpty(val)}
						name='last_name'
						maxLength='50'
						disabled={ordering}
					/>
				</div>
				<div className='flex flex-wrap gap-2 xl:gap-3'>
					<div className='flex-1'>
						<InputField
							name='country_name'
							placeholder='Country / Region'
							list='countries'
							datalist={countryNames}
							validator={val => validators.option(val, countryNames)}
							disabled={ordering}
							maxLength={80}
						/>
					</div>
					<div className='flex-1'>
						<InputField
							name='state_name'
							placeholder='State'
							list='states'
							validator={val => (stateNames.length > 0 ? validators.option(val, stateNames) : '')}
							datalist={stateNames}
							ref={stateRef}
							disabled={ordering}
							maxLength={80}
						/>
					</div>
					<div className='w-full lg:mt-0 lg:flex-1'>
						<InputField
							name='city'
							placeholder='City'
							validator={val => validators.notEmpty(val)}
							disabled={ordering}
							maxLength={80}
						/>
					</div>
				</div>
				<div className='flex space-x-2 xl:space-x-3'>
					<div className='flex-1'>
						<InputField
							name='address_line1'
							placeholder='Billing Address'
							validator={val => validators.notEmpty(val)}
							disabled={ordering}
							maxLength={200}
						/>
					</div>
					<div className='flex-1'>
						<InputField
							placeholder='Postal Code'
							type='text'
							name='postal_code'
							validator={val => validators.reg(val, /^[\d a-zA-Z-]+$/g)}
							maxLength='32'
							disabled={ordering}
						/>
					</div>
				</div>
				<div className='flex space-x-2 xl:space-x-3'>
					<InputField
						type='email'
						name='email'
						placeholder='Email Address(required*)'
						validator={val => validators.email(val)}
						disabled={ordering}
						maxLength={80}
						required
					/>
					<InputField
						name='phone'
						type='tel'
						placeholder='phone(required*)'
						validator={val => validators.notEmpty(val)}
						maxLength={30}
						disabled={ordering}
						required
					/>
				</div>
				<div className='text-xs text-error'>{errorDes}</div>
				<button
					type={ordering ? 'button' : 'submit'}
					className='mt-6 inline-flex w-full items-center justify-center gap-1 rounded-[12px] border-0 text-white p-3 font-bold bg-primary-600 hover:bg-primary-700 focus:border-0 focus:outline-none'
				>
					{ordering ? <Loading width={24} height={24} className='inline-block' /> : null}
					Next
				</button>
			</form>
		</div>
	)
}

export default function Form({ product }) {
	const { productTypeDes, price, discount, name, currency } = product
	return (
		<div className='mx-auto rounded-lg pt-2 xl:max-w-[640px]'>
			<h1 className='mb-2 text-[20px] font-bold text-black'>Checkout</h1>
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
			<CreditCardForm product={product} />
		</div>
	)
}
