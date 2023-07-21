export default function useValidator({ form, setForm, rules, page }) {
	const regex = {
		email: /^[\w.-]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,})+$/,
		specialChars: /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
		numbers: /\d/,
		upperAndLower: /^(?=.*[a-z])(?=.*[A-Z]).*$/
	};

	return {
		validateForm: function () {
			const updatedForm = { ...form };
			updatedForm[page].forEach(field => (field.errors = []));

			for (const field of updatedForm[page]) {
				if (rules[field.name].required && !field.value.trim()) {
					field.errors.push(`${field.label.capitalize()} is required`);
					continue;
				}

				const [min, max] = [rules[field.name]?.min, rules[field.name]?.max];
				if (field.value.length < min || field.value.length > max)
					field.errors.push(
						`${field.label.capitalize()} must be between ${min} and ${max} characters long`
					);

				switch (field.name) {
					case 'username':
						if (rules.username.noWhitespaces && field.value.includes(' '))
							field.errors.push('Username must not contain whitespaces');
						if (
							rules.username.noSpecials &&
							regex.specialChars.test(field.value)
						)
							field.errors.push('Username must not contain special characters');
						if (rules.username.noNumbers && regex.numbers.test(field.value))
							field.errors.push('Username must not contain numbers');
						if (
							rules.username.allLower &&
							field.value !== field.value.toLowerCase()
						)
							field.errors.push('Username must be all lowercase');
						if (
							rules.username.allUpper &&
							field.value !== field.value.toUpperCase()
						)
							field.errors.push('Username must be all uppercase');
						break;

					case 'email':
						if (!regex.email.test(field.value))
							field.errors.push('Invalid email address');
						break;

					case 'password':
						if (
							rules.password.upperAndLower &&
							!regex.upperAndLower.test(field.value)
						)
							field.errors.push('Password must contain upper and lower case');
						if (rules.password.numbers && !regex.numbers.test(field.value))
							field.errors.push('Password must contain numbers');
						if (
							rules.password.specialChars &&
							!regex.specialChars.test(field.value)
						)
							field.errors.push('Password must contain special characters');
						break;
					case 'confirmPass':
						if (
							field.value !==
							form[page].find(f => f.name === field.matching).value
						)
							field.errors.push("Passwords aren't matching");
						break;
				}
			}

			setForm(updatedForm);
			const isFormValid = form[page].every(field => !field.errors.length);

			return isFormValid;
		},
		username: function (value) {
			let isValid = true;
			const errors = [];
			const username = rules.username;

			if (username.required && !value.trim())
				return [false, ['Username is required.']];

			if (value < username.min || value > username.max) {
				isValid = false;
				errors.push(
					`Username must be between ${username.min} and ${username.max} characters long.`
				);
			}
			if (username.noWhitespaces && value.contains(' ')) {
				isValid = false;
				errors.push('Username must not contain whitespaces.');
			}
			if (username.noNumbers && regex.numbers.test(value)) {
				isValid = false;
				errors.push('Username must not contai numbers.');
			}
			if (username.noSpecials && regex.specialChars.test(value)) {
				isValid = false;
				errors.push('Username must not contain special characters.');
			}
			if (username.allLower && value !== value.toLowerCase()) {
				isValid = false;
				errors.push('Username must be all lowercase/');
			}
			if (username.allUpper && value !== value.toUpperCase()) {
				isValid = false;
				errors.push('Username must be all uppercase.');
			}

			return [isValid, errors];
		},
		email: function (value) {
			const email = rules.email;

			if (email.required && !value.trim())
				return [false, ['Email is required.']];

			if (!regex.email.test(value)) return [false, ['Email invalid.']];
		},
		password: function (value) {
			let isValid = true;
			const errors = [];
			const password = rules.password;

			if (password.required && !value.trim())
				return [false, ['Password is required.']];
			if (password.numbers && !regex.numbers.test(value)) {
				isValid = false;
				errors.push('Password must contain numbers.');
			}
			if (password.specialChars && !regex.specialChars.test(value)) {
				isValid = false;
				errors.push('Password must contain special characters.');
			}
			if (password.upperAndLower && !regex.upperAndLower.test(value)) {
				isValid = false;
				errors.push('Password must contain both upper and lower case.');
			}
			return [isValid, errors];
		},
		confirmPass: function (value) {
			let isValid = true;
			const errors = [];
			const confirmPass = rules.confirmPass;

			if (confirmPass.required && !value.trim())
				return [false, ['Confirm Password is required.']];
			if (value !== form[page].find(f => f.name === field.matching).value)
				return [false, ["Passwords aren't matching"]];
		}
	};

	// return () => {
	// 	const updatedForm = { ...form };
	// 	updatedForm[page].forEach(field => (field.errors = []));

	// 	for (const field of updatedForm[page]) {
	// 		if (rules[field.name].required && !field.value.trim()) {
	// 			field.errors.push(`${field.label.capitalize()} is required`);
	// 			continue;
	// 		}

	// 		const [min, max] = [rules[field.name]?.min, rules[field.name]?.max];
	// 		if (field.value.length < min || field.value.length > max)
	// 			field.errors.push(
	// 				`${field.label.capitalize()} must be between ${min} and ${max} characters long`
	// 			);

	// 		switch (field.name) {
	// 			case 'username':
	// 				if (rules.username.noWhitespaces && field.value.includes(' '))
	// 					field.errors.push('Username must not contain whitespaces');
	// 				if (rules.username.noSpecials && regex.specialChars.test(field.value))
	// 					field.errors.push('Username must not contain special characters');
	// 				if (rules.username.noNumbers && regex.numbers.test(field.value))
	// 					field.errors.push('Username must not contain numbers');
	// 				if (
	// 					rules.username.allLower &&
	// 					field.value !== field.value.toLowerCase()
	// 				)
	// 					field.errors.push('Username must be all lowercase');
	// 				if (
	// 					rules.username.allUpper &&
	// 					field.value !== field.value.toUpperCase()
	// 				)
	// 					field.errors.push('Username must be all uppercase');
	// 				break;

	// 			case 'email':
	// 				if (!regex.email.test(field.value))
	// 					field.errors.push('Invalid email address');
	// 				break;

	// 			case 'password':
	// 				if (
	// 					rules.password.upperAndLower &&
	// 					!regex.upperAndLower.test(field.value)
	// 				)
	// 					field.errors.push('Password must contain upper and lower case');
	// 				if (rules.password.numbers && !regex.numbers.test(field.value))
	// 					field.errors.push('Password must contain numbers');
	// 				if (
	// 					rules.password.specialChars &&
	// 					!regex.specialChars.test(field.value)
	// 				)
	// 					field.errors.push('Password must contain special characters');
	// 				break;
	// 			case 'confirmPass':
	// 				if (
	// 					field.value !==
	// 					form[page].find(f => f.name === field.matching).value
	// 				)
	// 					field.errors.push("Passwords aren't matching");
	// 				break;
	// 		}
	// 	}

	// 	setForm(updatedForm);
	// 	const isFormValid = form[page].every(field => !field.errors.length);

	// 	return isFormValid;
	// };
}
