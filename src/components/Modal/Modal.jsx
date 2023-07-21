import './Modal.scss';

export default function Modal({
	modalOpen,
	children,
	className = '',
	...props
}) {
	return (
		<>
			<div
				className='modal-overlay'
				{...props}
			/>
			<div className={`modal ${className} ${modalOpen ? 'open' : ''}`}>
				<div className='modal-content'>{children}</div>
			</div>
		</>
	);
}
