import { useAuth } from '../../helpers';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCookie, useFetch, useValidator } from '../../hooks';
import api from '../../api';
import { Fragment, useEffect, useState } from 'react';
import './Login.scss';

const defaultForm = {
	login: [
		{
			name: 'email',
			type: 'email',
			label: 'email',
			value: '',
			errors: []
		},
		{
			name: 'password',
			type: 'password',
			label: 'password',
			value: '',
			errors: []
		}
	],
	register: [
		{
			name: 'username',
			type: 'text',
			label: 'username',
			value: '',
			errors: []
		},
		{
			name: 'email',
			type: 'email',
			label: 'email',
			value: '',
			errors: []
		},
		{
			name: 'password',
			type: 'password',
			label: 'password',
			value: '',
			matching: 'confirmPass',
			errors: []
		},
		{
			name: 'confirmPass',
			type: 'password',
			label: 'confirm password',
			value: '',
			matching: 'password',
			errors: []
		}
	]
};

const formRules = {
	username: {
		required: true,
		noWhitespaces: true,
		noNumbers: false,
		noSpecials: true,
		allLower: false,
		allUpper: false,
		min: 3,
		max: 20
	},
	email: {
		required: true
	},
	password: {
		required: true,
		numbers: true,
		specialChars: true,
		upperAndLower: true,
		min: 5,
		max: 30
	},
	confirmPass: {
		required: true
	}
};

export default function Login() {
	const cookie = useCookie('user');
	const isLoggedIn = useAuth();
	const navigate = useNavigate();
	const [page, setPage] = useState(sessionStorage.getItem('page') || 'login');
	const [form, setForm] = useState(defaultForm);
	const validate = useValidator(form, setForm, formRules, page);
	const [error, setError] = useState(null);

	const [dbUsers] = useFetch('/users');

	const handleInput = (index, fieldValue) => {
		setForm(prevForm => {
			const updated = { ...prevForm };
			updated[page][index].value = fieldValue;
			return updated;
		});
	};

	useEffect(() => sessionStorage.setItem('page', page), [page]);

	const findUser = () => {
		const usernameField = form[page].find(field => field.name === 'username');
		const emailField = form[page].find(field => field.name === 'email');
		const passwordField = form[page].find(field => field.name === 'password');

		return page === 'register'
			? dbUsers.find(
					user =>
						user.username === usernameField.value ||
						user.email === emailField.value
			  )
			: dbUsers.find(
					user =>
						user.email === emailField.value &&
						user.password === passwordField.value
			  );
	};

	const handleSubmit = e => {
		e.preventDefault();
		const isValid = validate();

		if (isValid) {
			const user = findUser();
			const isUserFound = !!user;

			switch (page) {
				case 'register':
					if (isUserFound)
						return setError(
							'User with this email or username already exists. Please choose another one.'
						);

					const userData = {
						email: form[page].find(field => field.name === 'email').value,
						username: form[page].find(field => field.name === 'username').value,
						password: form[page].find(field => field.name === 'password').value
					};

					setError(null);
					api.post('/users', userData).then(resp => cookie.write(resp.data.id));
					navigate('/');
					break;

				case 'login':
					if (!isUserFound)
						return setError('Wrong email or password, please try again.');

					setError(null);
					cookie.write(user.id);
					navigate('/');
					break;
			}
		}
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
				onSubmit={handleSubmit}
				noValidate
			>
				{form[page].map((field, index) => (
					<Fragment key={field.name}>
						<label
							htmlFor={field.name}
							className={!!field.errors.length ? 'error' : ''}
						>
							{field.label}
							<input
								type={field.type}
								id={field.name}
								value={field.value}
								onChange={e => handleInput(index, e.target.value)}
								autoComplete='off'
							/>
						</label>
						{!!field.errors.length && (
							<ul className='form__errors'>
								{field.errors.map((error, index) => (
									<li
										key={`error-${index + 1}`}
										className='form__errors-error'
									>
										{error}
									</li>
								))}
							</ul>
						)}
					</Fragment>
				))}
				<input
					type='submit'
					value={page}
				/>
			</form>
			{error && <p className='login-error'>{error}</p>}
			<div className='switch-form'>
				<p>{page === 'login' ? "Don't" : 'Already'} have an account?</p>
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
