import { useAuth } from '../../helpers';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.scss';

export default function Login() {
	const isLoggedIn = useAuth();
	const [page, setPage] = useState('login');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPass, setConfirmPass] = useState('');

	const formElements = {
		login: [
			{
				type: 'text',
				label: 'username',
				value: username,
				function: e => setUsername(e.target.value)
			},
			{
				type: 'password',
				label: 'password',
				value: password,
				function: e => setPassword(e.target.value)
			}
		],
		register: [
			{
				type: 'text',
				label: 'username',
				value: username,
				function: e => setUsername(e.target.value)
			},
			{
				type: 'password',
				label: 'password',
				value: password,
				function: e => setPassword(e.target.value)
			},
			{
				type: 'password',
				label: 'confirm password',
				value: confirmPass,
				function: e => setConfirmPass(e.target.value),
				matching: password
			}
		]
	};

	return isLoggedIn ? (
		<Navigate
			to='/'
			replace
		/>
	) : (
		<main className='form__wrapper'>
			<h1 className='head-text'>{page}</h1>
			<form
				className='form'
				onSubmit={e => e.preventDefault()}
			>
				{formElements[page].map((el, index) => (
					<label
						key={el.label}
						htmlFor={el.label}
					>
						{el.label}
						<input
							type={el.type}
							id={el.label}
							value={el.value}
							onChange={el.function}
							autoComplete='off'
							autoFocus={index === 0}
						/>
					</label>
				))}
				<input
					type='submit'
					value={page}
				/>
			</form>
			<div className='switch-form'>
				<p>
					{page === 'login'
						? "Don't have an account?"
						: 'Already have an account?'}
				</p>
				<button
					onClick={() =>
						setPage(prev => (prev === 'register' ? 'login' : 'register'))
					}
				>
					Sign {page === 'login' ? 'Up' : 'In'}
				</button>
			</div>
		</main>
	);
}
