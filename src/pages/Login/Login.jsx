import { useAuth } from '../../helpers';
import { Navigate } from 'react-router-dom';
import { useCookie, useValidator } from '../../hooks';
import api from '../../api';
import { useContext, useEffect, useState } from 'react';
import DataContext from '../../context/DataContext';
import { Button, Input } from '../../components';
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

export default function Login() {
	const { dbUsers, formRules } = useContext(DataContext);
	const cookie = useCookie('user');
	const isLoggedIn = useAuth();
	const [page, setPage] = useState(sessionStorage.getItem('page') || 'login');
	const [form, setForm] = useState(defaultForm);
	const validate = useValidator({
		form: form,
		setForm: setForm,
		rules: formRules,
		page: page
	});
	const [loginError, setLoginError] = useState(null);

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
		const isValid = validate.validateForm();

		if (isValid) {
			const user = findUser();
			const isUserFound = !!user;

			switch (page) {
				case 'register':
					if (isUserFound)
						return setLoginError(
							'User with this email or username already exists. Please choose another one.'
						);

					const userData = {
						email: form[page].find(field => field.name === 'email').value,
						username: form[page].find(field => field.name === 'username').value,
						password: form[page].find(field => field.name === 'password').value
					};

					setLoginError(null);
					api.post('/users', userData).then(resp => {
						cookie.write(resp.data.id);
						location.reload();
					});

					break;

				case 'login':
					if (!isUserFound)
						return setLoginError('Wrong email or password, please try again.');

					setLoginError(null);
					cookie.write(user.id);
					location.reload();
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
					<Input
						key={field.name}
						label={field.label}
						type={field.type}
						value={field.value}
						setValue={e => handleInput(index, e.target.value)}
						isValid={!field.errors.length}
						errors={field.errors}
					/>
				))}
				<Button
					type='submit'
					variant='contained'
					style={{ marginBlock: '2rem' }}
				>
					{page}
				</Button>
			</form>
			{loginError && <p className='login-error'>{loginError}</p>}
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
