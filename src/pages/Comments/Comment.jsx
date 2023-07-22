import { useState } from 'react';
import api from '../../api';
import defaultAvatar from '../../assets/images/default.webp';
import dayjs from 'dayjs';
import {
	Button,
	Buttons,
	Votes,
	ReplyForm,
	Replies,
	Modal
} from '../../components';
import { useContext } from 'react';
import DataContext from '../../context/DataContext';

export default function Comment({
	data,
	author,
	setPageComments,
	className = ''
}) {
	const { currentUser, isBigScreen } = useContext(DataContext);
	const [editMode, setEditMode] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [replyMode, setReplyMode] = useState(false);
	const [edited, setEdited] = useState(data.content);
	const [replies, setReplies] = useState(data.replies || []);

	const deleteComment = () => {
		setPageComments(prevComments =>
			prevComments.filter(comment => comment.id !== data.id)
		);
		api.delete(`/comments/${data.id}`).catch(err => {
			alert(
				'An error occurred deleting your comment. Please check console for more details.'
			);
			console.error(err);
		});
		setOpenDeleteModal(false);
	};

	const editComment = () => {
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
				{isBigScreen && <Votes comment={data} />}
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
						{isBigScreen && (
							<Buttons
								author={author}
								setOpenDeleteModal={setOpenDeleteModal}
								setEditMode={setEditMode}
								setReplyMode={setReplyMode}
							/>
						)}
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
						{!isBigScreen && (
							<div className='mobile-buttons'>
								<Votes comment={data} />
								<Buttons
									author={author}
									setOpenDeleteModal={setOpenDeleteModal}
									setEditMode={setEditMode}
									setReplyMode={setReplyMode}
								/>
							</div>
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
			<Modal
				className='delete-modal'
				modalOpen={openDeleteModal}
			>
				<h2>Delete Comment</h2>
				<p>
					Are you sure you want to delete this comment? This will remove comment
					and can't be undone.
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
						onClick={deleteComment}
					>
						Yes, delete
					</Button>
				</div>
			</Modal>
		</>
	);
}
