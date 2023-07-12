import { useState } from 'react';
import {
	FaTrash as DeleteIcon,
	FaPencilAlt as EditIcon,
	FaReply as ReplyIcon
} from 'react-icons/fa';
import api from '../../api';
import defaultAvatar from '../../assets/images/default.webp';
import dayjs from 'dayjs';
import { Button } from '../../components';

export default function Comment({
	data,
	author,
	currentUserId,
	setPageComments
}) {
	const [editMode, setEditMode] = useState(false);
	const [replyMode, setReplyMode] = useState(false);
	const [edited, setEdited] = useState(data.content);
	const [isUpvoted, setIsUpvoted] = useState(false);
	const [isDownvoted, setIsDownvoted] = useState(false);

	const deleteComment = () => {
		// TODO: Custom modal to confirm deleting comments
		if (confirm('Sure?')) {
			setPageComments(prevComments =>
				prevComments.filter(comment => comment.id !== data.id)
			);
			api
				.delete(`/comments/${data.id}`)
				.then(() => alert('Comment successfully deleted'))
				.catch(err => {
					alert(
						'An error occurred deleting your comment. Please check console for more details.'
					);
					console.error(err);
				});
		}
	};

	const editComment = () => {
		// TODO: Add error if not editable instead of just returning
		if (!edited.trim() || data.content === edited.trim()) return;

		setPageComments(prevComments =>
			prevComments.map(comment =>
				comment.id === data.id
					? { ...comment, content: edited.trim() }
					: comment
			)
		);
		api
			.put(`/comments/${data.id}`, { content: edited.trim() })
			.then(() => {
				alert('Comment successfully edited.');
				setEditMode(false);
			})
			.catch(err => {
				alert(
					'An error occured editing your comment. Please check console for more details'
				);
				console.error(err);
			});
	};

	const replyTo = () => {
		console.log(data.id);
	};

	const upvote = () => {
		setIsUpvoted(true);
	};

	const downvote = () => {
		console.log('downvote');
	};

	return (
		<article className='comment'>
			<div className='comment-upvotes'>
				<button
					className='comment-upvotes-button'
					disabled={!isUpvoted && isDownvoted}
					onClick={upvote}
				>
					+
				</button>
				<span className='comment-upvotes-value | text-primary-500 fw-bold'>
					{beautifyNumber(data.upvotes)}
				</span>
				<button
					className='comment-upvotes-button'
					disabled={isUpvoted && !isDownvoted}
					onClick={downvote}
				>
					-
				</button>
			</div>
			<div className='comment-content-wrapper'>
				<div className='comment-upper'>
					<div>
						<img
							className='comment-avatar'
							width='32'
							height='32'
							src={author?.avatar || defaultAvatar}
							alt={`${author?.username || 'Deleted User'}`}
						/>
						<h2 className='comment-username | fw-bold'>
							{author?.username || 'Deleted User'}
							{author?.id === currentUserId && <span>you</span>}
						</h2>
						<p className='comment-date | text-accent-200'>
							{dayjs(dayjs(data.createdAt).$d.getTime()).fromNow()}
						</p>
					</div>
					<div>
						{author?.id === currentUserId ? (
							<>
								<Button
									startIcon={<DeleteIcon />}
									onClick={() => deleteComment()}
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
								onClick={() => replyTo()}
							>
								Reply
							</Button>
						)}
					</div>
				</div>
				<div className='comment-lower'>
					{!editMode ? (
						<p className='comment-content'>
							{data.content.split(' ').map((word, index) =>
								word.startsWith('@') && word.length > 3 ? (
									<Button
										key={`word-${index + 1}`}
										className='mention'
										style={{ display: 'inline-block' }}
									>
										{`${word}`}
									</Button>
								) : (
									` ${word} `
								)
							)}
						</p>
					) : (
						<form onSubmit={() => editComment()}>
							<textarea
								value={edited}
								onChange={e => setEdited(e.target.value)}
								autoFocus
								style={{ width: '100%' }}
								className='comment-form-content'
							/>
							<Button
								type='submit'
								variant='contained'
								style={{ marginLeft: 'auto' }}
							>
								Update
							</Button>
						</form>
					)}
				</div>
			</div>
		</article>
	);
}

function beautifyNumber(number) {
	if (number < 1000) {
		return number.toString();
	} else if (number >= 1000 && number < 1000000) {
		return (number / 1000).toFixed(1) + 'k';
	} else if (number >= 1000000 && number < 1000000000) {
		return (number / 1000000).toFixed(1) + 'm';
	} else {
		return (number / 1000000000).toFixed(1) + 'b';
	}
}
