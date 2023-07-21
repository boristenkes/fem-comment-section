import { useContext, useEffect, useState } from 'react';
import DataContext from '../../context/DataContext';
import { FaTrash as DeleteIcon, FaPencilAlt as EditIcon } from 'react-icons/fa';
import { FaArrowRightFromBracket as LogoutIcon } from 'react-icons/fa6';
import defaultAvatar from '../../assets/images/default.webp';
import { Button, Input, Modal } from '../../components';
import { useCookie } from '../../hooks';
import './UserMenu.scss';
import api from '../../api';
import { useValidator } from '../../hooks';

export default function UserMenu() {
	const { currentUser, formRules } = useContext(DataContext);
	const cookie = useCookie('user');
	const [menuOpen, setMenuOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editAvatar, setEditAvatar] = useState(
		currentUser?.avatar || defaultAvatar
	);
	const [editUsername, setEditUsername] = useState(currentUser?.username || '');
	const [editEmail, setEditEmail] = useState(currentUser?.email || '');
	const [editPassword, setEditPassword] = useState(currentUser?.password || '');
	const validate = useValidator({ rules: formRules });

	useEffect(() => {
		setEditAvatar(currentUser?.avatar || defaultAvatar);
		setEditUsername(currentUser?.username || '');
		setEditEmail(currentUser?.email || '');
		setEditPassword(currentUser?.password || '');
	}, [currentUser]);

	const deleteAccount = () => {
		if (confirm('Sure, sure?')) {
			api
				.delete(`/users/${currentUser.id}`)
				.then(() => {
					cookie.destroy();
					location.reload();
					alert('Account successfully deleted.');
				})
				.catch(err => {
					alert('Error deleting your account. Check console for details');
					console.error(err);
				});
		}
	};

	const editAccount = () => {
		const isUrlValid = new URL(editAvatar);
		if (!isUrlValid) return;

		const editedData = {};
		if (editAvatar !== currentUser?.avatar) editedData.avatar = editAvatar;
		if (editUsername !== currentUser?.username)
			editedData.username = editUsername;
		if (editEmail !== currentUser?.email) editedData.email = editEmail;
		if (editPassword !== currentUser?.password)
			editedData.password = editPassword;

		const noChanges = Object.keys(editedData).length === 0;

		if (noChanges) return;

		api
			.put(`/users/${currentUser?.id}`, editedData)
			.then(() => location.reload());
	};

	const logout = () => {
		cookie.destroy();
		location.reload();
	};

	return (
		<div className='user-menu'>
			<button
				onClick={() => setMenuOpen(prev => !prev)}
				className='user-menu-icon'
				style={{
					backgroundImage: `url(${currentUser?.avatar || defaultAvatar})`
				}}
			/>
			<div className={`user-menu-options-wrapper ${menuOpen ? 'open' : ''}`}>
				<div className='user-menu-options'>
					<img
						src={currentUser?.avatar || defaultAvatar}
						alt={currentUser?.username}
						width={72}
						height={72}
						style={{
							borderRadius: '50%',
							marginInline: 'auto',
							marginBottom: '.5rem'
						}}
					/>
					<Button
						onClick={() => setEditModalOpen(prev => !prev)}
						startIcon={<EditIcon />}
						variant='contained'
					>
						Edit account
					</Button>
					<Button
						color='danger'
						startIcon={<DeleteIcon />}
						variant='contained'
						onClick={deleteAccount}
					>
						Delete account
					</Button>
					<Button
						onClick={logout}
						startIcon={<LogoutIcon />}
						variant='contained'
					>
						Logout
					</Button>
				</div>
			</div>
			<Modal
				className='edit-modal'
				modalOpen={editModalOpen}
			>
				<form
					className='edit-modal-form'
					onSubmit={editAccount}
				>
					<div className='edit-modal-avatar-wrapper'>
						<img
							src={editAvatar}
							alt={editUsername}
							width={72}
							height={72}
							className='edit-modal-avatar'
							onError={e => {
								e.target.onerror = null; // Reset the onerror event handler to avoid potential infinite loops
								e.target.src = defaultAvatar; // Set a fallback image if the specified avatar fails to load
							}}
						/>
						<Input
							label='Avatar'
							type='url'
							value={editAvatar}
							setValue={e => setEditAvatar(e.target.value)}
							errors={[]}
						/>
					</div>

					<Input
						label='Username'
						type='text'
						value={editUsername}
						setValue={e => setEditUsername(e.target.value)}
						errors={[]}
					/>
					<Input
						label='Email'
						type='email'
						value={editEmail}
						setValue={e => setEditEmail(e.target.value)}
						errors={[]}
					/>
					<Input
						label='Password'
						type='password'
						value={editPassword}
						setValue={e => setEditPassword(e.target.value)}
						errors={[]}
					/>
					<div className='edit-modal-buttons'>
						<Button
							type='button'
							variant='outlined'
							onClick={() => setEditModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							variant='contained'
						>
							Save changes
						</Button>
					</div>
				</form>
			</Modal>
			<Modal className='delete-modal'></Modal>
		</div>
	);
}
