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
	const [isAvatarValid, setIsAvatarValid] = useState(false);

	const [usernameErrors, setUsernameErrors] = useState([]);
	const [emailErrors, setEmailErrors] = useState([]);
	const [passwordErrors, setPasswordErrors] = useState([]);

	const [openDeleteModal, setOpenDeleteModal] = useState(false);

	const validate = useValidator({ rules: formRules });

	useEffect(() => {
		setEditAvatar(currentUser?.avatar || defaultAvatar);
		setEditUsername(currentUser?.username || '');
		setEditEmail(currentUser?.email || '');
		setEditPassword(currentUser?.password || '');
	}, [currentUser]);

	const deleteAccount = () => {
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
		setOpenDeleteModal(false);
	};

	const editAccount = () => {
		if (!isAvatarValid) return;

		const [isUsernameValid, usernameErrors] = validate.username(editUsername);
		const [isEmailValid, emailErrors] = validate.email(editEmail);
		const [isPasswordValid, passwordErrors] = validate.password(editPassword);

		const isEverythingValid =
			isUsernameValid && isEmailValid && isPasswordValid;

		if (isEverythingValid) {
			const editedData = {};
			if (editAvatar !== currentUser?.avatar) editedData.avatar = editAvatar;
			if (editUsername !== currentUser?.username)
				editedData.username = editUsername;
			if (editEmail !== currentUser?.email) editedData.email = editEmail;
			if (editPassword !== currentUser?.password)
				editedData.password = editPassword;

			const noChanges = Object.keys(editedData).length === 0;

			if (!noChanges)
				return api
					.put(`/users/${currentUser?.id}`, editedData)
					.then(() => location.reload());
		}

		if (!isUsernameValid) setUsernameErrors(usernameErrors);
		if (!isEmailValid) setEmailErrors(emailErrors);
		if (!isPasswordValid) setPasswordErrors(passwordErrors);
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
						onClick={() => setOpenDeleteModal(true)}
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
					noValidate
				>
					<div className='edit-modal-avatar-wrapper'>
						<img
							src={editAvatar}
							alt={editUsername}
							width={72}
							height={72}
							className='edit-modal-avatar'
							onError={() => setIsAvatarValid(false)}
							onLoad={() => setIsAvatarValid(true)}
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
						errors={usernameErrors}
					/>
					<Input
						label='Email'
						type='email'
						value={editEmail}
						setValue={e => setEditEmail(e.target.value)}
						errors={emailErrors}
					/>
					<Input
						label='Password'
						type='password'
						value={editPassword}
						setValue={e => setEditPassword(e.target.value)}
						errors={passwordErrors}
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
			<Modal
				className='delete-modal'
				modalOpen={openDeleteModal}
			>
				<h2>Delete Account</h2>
				<p>
					Are you sure you want to delete your account? This can not be undone.
				</p>
				<div className='buttons'>
					<Button
						variant='contained'
						onClick={() => setOpenDeleteModal(false)}
					>
						No, cancel
					</Button>
					<Button
						variant='contained'
						color='danger'
						onClick={deleteAccount}
					>
						Yes, delete
					</Button>
				</div>
			</Modal>
		</div>
	);
}
