import { v4 as uuid } from 'uuid';
import './Input.scss';

export default function Input({
	label = '',
	value,
	setValue,
	type = 'text',
	id,
	errors
}) {
	const randomId = uuid();

	return (
		<>
			<label
				htmlFor={id || randomId}
				className={`label ${!!errors.length ? 'error' : ''}`}
			>
				{label}
				<input
					type={type}
					value={value}
					onChange={setValue}
					id={id || randomId}
					className='input'
					autoComplete='off'
				/>
			</label>
			{!!errors.length && (
				<ul className='form__errors'>
					{errors.map((error, index) => (
						<li
							key={`error-${index + 1}`}
							className='form__errors-error'
						>
							{error}
						</li>
					))}
				</ul>
			)}
		</>
	);
}
