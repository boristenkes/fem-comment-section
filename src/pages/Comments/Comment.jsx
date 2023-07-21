import { useState } from 'react';
import {
	FaTrash as DeleteIcon,
	FaPencilAlt as EditIcon,
	FaReply as ReplyIcon
} from 'react-icons/fa';
import api from '../../api';
import defaultAvatar from '../../assets/images/default.webp';
import dayjs from 'dayjs';
import { Button, Votes, ReplyForm, Replies } from '../../components';
import { useContext } from 'react';
import DataContext from '../../context/DataContext';

export default function Comment({
	data,
	author,
	setPageComments,
	className = ''
}) {
	const { currentUser } = useContext(DataContext);
	const [editMode, setEditMode] = useState(false);
	const [replyMode, setReplyMode] = useState(false);
	const [edited, setEdited] = useState(data.content);
	const [replies, setReplies] = useState(data.replies || []);

	// TODO: Responiveness
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
		if (!edited.trim()) return;
		else if (data.content === edited.trim()) return setEditMode(false);

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

	return (
		<>
			<article className={`comment ${className}`}>
				<Votes comment={data} />
				<div className='comment-content-wrapper'>
					<div className='comment-upper'>
						<div>
							<img
								className='comment-avatar'
								width={32}
								height={32}
								src={author?.avatar || defaultAvatar}
								alt={`${author?.username || 'Deleted User'}`}
							/>
							<h2 className='comment-username | fw-bold'>
								{author?.username || 'Deleted User'}
								{author?.id === currentUser?.id && <span>you</span>}
							</h2>
							<p className='comment-date | text-accent-200'>
								{dayjs(dayjs(data.createdAt).$d.getTime()).fromNow()}
							</p>
						</div>
						<div>
							{author?.id === currentUser?.id ? (
								<>
									<Button
										startIcon={<DeleteIcon />}
										onClick={deleteComment}
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
			{!!replies?.length && (
				<Replies
					replyTo={data.id}
					replies={replies}
					setReplies={setReplies}
				/>
			)}
			{replyMode && (
				<ReplyForm
					comment={data}
					commentAuthor={author}
					setReplies={setReplies}
					setReplyMode={setReplyMode}
				/>
			)}
		</>
	);
}
