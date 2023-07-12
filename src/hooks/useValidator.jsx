export default function useValidator(form, setForm, rules, page) {
	const regex = {
		email: /^[\w.-]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,})+$/,
		specialChars: /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
		numbers: /\d/,
		upperAndLower: /^(?=.*[a-z])(?=.*[A-Z]).*$/
	};

	return () => {
		const updatedForm = { ...form };
		updatedForm[page].forEach(field => (field.errors = []));

		for (const field of updatedForm[page]) {
			// updatedForm[page].forEach(field => {
			if (rules[field.name].required && !field.value.trim()) {
				console.log(rules[field.name]);
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
					if (rules.username.noSpecials && regex.specialChars.test(field.value))
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
		// });

		setForm(updatedForm);
		const isFormValid = form[page].every(field => !field.errors.length);

		return isFormValid;
	};
}
