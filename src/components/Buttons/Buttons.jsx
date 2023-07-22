import { useContext } from 'react';
import Button from '../Button/Button';
import DataContext from '../../context/DataContext';
import {
	FaTrash as DeleteIcon,
	FaPencilAlt as EditIcon,
	FaReply as ReplyIcon
} from 'react-icons/fa';

export default function Buttons({
	author,
	setOpenDeleteModal,
	setEditMode,
	setReplyMode
}) {
	const { currentUser } = useContext(DataContext);

	return (
		<div>
			{author?.id === currentUser?.id ? (
				<>
					<Button
						startIcon={<DeleteIcon />}
						onClick={() => setOpenDeleteModal(prev => !prev)}
						color='danger'
					>
						Delete
					</Button>
					<Button
						startIcon={<EditIcon />}
						onClick={() => setEditMode(prev => !prev)}
					>
						Edit
					</Button>
				</>
			) : (
				<Button
					startIcon={<ReplyIcon />}
					onClick={() => setReplyMode(prev => !prev)}
				>
					Reply
				</Button>
			)}
		</div>
	);

	// {author?.id === currentUser?.id ? (
	// 	<>
	// 		<Button
	// 			startIcon={<DeleteIcon />}
	// 			onClick={() => setOpenDeleteModal(prev => !prev)}
	// 			color='danger'
	// 		>
	// 			Delete
	// 		</Button>
	// 		<Button
	// 			startIcon={<EditIcon />}
	// 			onClick={() => setEditMode(prev => !prev)}
	// 		>
	// 			Edit
	// 		</Button>
	// 	</>
	// ) : (
	// 	<Button
	// 		startIcon={<ReplyIcon />}
	// 		onClick={() => setReplyMode(prev => !prev)}
	// 	>
	// 		Reply
	// 	</Button>
	// )}
}
