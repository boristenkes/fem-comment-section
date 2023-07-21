import './Button.scss';

export default function Button({
	children,
	className = '',
	variant = 'text',
	color = 'primary',
	startIcon,
	onClick,
	...props
}) {
	return (
		<button
			className={`btn ${className || ''}`}
			data-variant={variant}
			data-color={color}
			onClick={onClick}
			{...props}
		>
			{startIcon}
			{children}
		</button>
	);
}
