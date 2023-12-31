import { useContext, useEffect, useState } from 'react';
import DataContext from '../../context/DataContext';
import defaultAvatar from '../../assets/images/default.webp';
import dayjs from 'dayjs';
import { Button, Buttons, Modal, ReplyForm, Loader } from '../../components';
import {
	FaTrash as DeleteIcon,
	FaPencilAlt as EditIcon,
	FaReply as ReplyIcon
} from 'react-icons/fa';
import api from '../../api';

export default function Reply({ replyTo, data, author, setReplies }) {
	const { currentUser, dbComments, isBigScreen } = useContext(DataContext);
	const [editMode, setEditMode] = useState(false);
	const [replyMode, setReplyMode] = useState(false);
	const [votes, setVotes] = useState(data.upvotes);
	const [edited, setEdited] = useState(data.content);
	const [upvotedComments, setUpvotedComments] = useState(
		currentUser?.upvotedComments || []
	);
	const [downvotedComments, setDownvotedComments] = useState(
		currentUser?.downvotedComments || []
	);
	const [isUpvoted, setIsUpvoted] = useState(
		upvotedComments?.includes(data.id)
	);
	const [isDownvoted, setIsDownvoted] = useState(
		downvotedComments?.includes(data.id)
	);
	const [commentReplyingTo, setCommentReplyingTo] = useState(null);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [votesUpdating, setVotesUpdating] = useState(false);

	useEffect(() => {
		setCommentReplyingTo(dbComments.find(comment => comment.id === replyTo));
	}, [dbComments]);

	useEffect(() => {
		setIsUpvoted(upvotedComments?.includes(data.id));
		setIsDownvoted(downvotedComments?.includes(data.id));
	}, [upvotedComments, downvotedComments]);

	useEffect(() => {
		setUpvotedComments(currentUser?.upvotedComments || []);
		setDownvotedComments(currentUser?.downvotedComments || []);
	}, [currentUser]);

	const deleteReply = async () => {
		await setReplies(prevReplies => {
			const updatedReplies = prevReplies.filter(reply => reply.id !== data.id);
			api.put(`/comments/${replyTo}`, { replies: updatedReplies });
			return updatedReplies;
		});
		setOpenDeleteModal(false);
	};

	const editReply = async () => {
		await setReplies(prevReplies => {
			const updatedReplies = prevReplies.map(reply =>
				reply.id === data.id ? { ...reply, content: edited } : reply
			);
			api
				.put(`/comments/${replyTo}`, { replies: updatedReplies })
				.then(() => setEditMode(false));
			return updatedReplies;
		});
	};

	const handleVote = async (
		newUpvotedComments,
		newDownvotedComments,
		newVotes
	) => {
		setVotesUpdating(true);
		try {
			await api.put(`/users/${currentUser.id}`, {
				upvotedComments: newUpvotedComments,
				downvotedComments: newDownvotedComments
			});

			await setReplies(prevReplies => {
				const updatedReplies = prevReplies.map(reply =>
					reply.id === data.id ? { ...reply, upvotes: newVotes } : reply
				);

				api.put(`/comments/${replyTo}`, { replies: updatedReplies });
				return updatedReplies;
			});
		} catch (error) {
			alert(
				'Error appeared updating votes. Check console for more information.'
			);
			console.error('Error updating database:', error);
		} finally {
			setVotesUpdating(false);
		}
	};

	const upvote = () => {
		let newVotes = votes;
		let newUpvotedComments = upvotedComments;
		let newDownvotedComments = downvotedComments;

		if (currentUser) {
			if (isUpvoted) {
				// Remove comment from upvoted comments
				newUpvotedComments = newUpvotedComments.filter(id => id !== data.id);
				// Remove one vote
				newVotes--;
			} else if (isDownvoted) {
				// Add comment to upvoted comments
				newUpvotedComments = [...newUpvotedComments, data.id];
				// Remove comment from downvoted comments
				newDownvotedComments = newDownvotedComments.filter(
					id => id !== data.id
				);
				// Add one vote for removing downvote, and one for upvoting
				newVotes += 2;
			} else {
				// Add comment to upvoted comments
				newUpvotedComments = [...newUpvotedComments, data.id];
				// Add one vote
				newVotes++;
			}
			setUpvotedComments(newUpvotedComments);
			setDownvotedComments(newDownvotedComments);
			setVotes(newVotes);

			handleVote(newUpvotedComments, newDownvotedComments, newVotes);
		}
	};

	const downvote = () => {
		let newVotes = votes;
		let newUpvotedComments = upvotedComments;
		let newDownvotedComments = downvotedComments;

		if (currentUser) {
			if (isDownvoted) {
				// Remove comment from downvoted comments
				newDownvotedComments = newDownvotedComments.filter(
					id => id !== data.id
				);
				// Remove one vote
				newVotes++;
			} else if (isUpvoted) {
				// Add comment to downvoted comments
				newDownvotedComments = [...newDownvotedComments, data.id];
				// Remove comment from upvoted comments
				newUpvotedComments = newUpvotedComments.filter(id => id !== data.id);
				// Remove one vote for removing upvote, and one for downvoting
				newVotes -= 2;
			} else {
				// Add comment to downvoted comments
				newDownvotedComments = [...newDownvotedComments, data.id];
				// Remove one vote
				newVotes--;
			}
			setUpvotedComments(newUpvotedComments);
			setDownvotedComments(newDownvotedComments);
			setVotes(newVotes);

			handleVote(newUpvotedComments, newDownvotedComments, newVotes);
		}
	};

	return (
		<>
			<article className='comment comment-reply'>
				{isBigScreen && (
					<div className='comment-upvotes'>
						{votesUpdating && (
							<>
								<span className='loader-overlay' />
								<Loader
									absolute
									fontSizes='20px'
									style={{
										top: '30%',
										left: '40%',
										color: 'var(--clr-primary-100)'
									}}
								/>
							</>
						)}
						<button
							className='comment-upvotes-button'
							onClick={upvote}
							data-active={isUpvoted}
						>
							+
						</button>
						<span className='comment-upvotes-value | text-primary-500 fw-bold'>
							{beautifyNumber(votes)}
						</span>
						<button
							className='comment-upvotes-button'
							onClick={downvote}
							data-active={isDownvoted}
						>
							-
						</button>
					</div>
				)}
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
						{/* <div>
							{author?.id === currentUser?.id ? (
								<>
									<Button
										startIcon={<DeleteIcon />}
										onClick={() => setOpenDeleteModal(true)}
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
						</div> */}
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
							<form onSubmit={editReply}>
								<textarea
									value={edited}
									onChange={e => setEdited(e.target.value)}
									autoFocus
									className='comment-form-content'
									style={{ width: '100%' }}
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
								<div className='comment-upvotes'>
									{votesUpdating && (
										<>
											<span className='loader-overlay' />
											<Loader
												absolute
												fontSizes='20px'
												style={{
													top: '30%',
													left: '40%',
													color: 'var(--clr-primary-100)'
												}}
											/>
										</>
									)}
									<button
										className='comment-upvotes-button'
										onClick={upvote}
										data-active={isUpvoted}
									>
										+
									</button>
									<span className='comment-upvotes-value | text-primary-500 fw-bold'>
										{beautifyNumber(votes)}
									</span>
									<button
										className='comment-upvotes-button'
										onClick={downvote}
										data-active={isDownvoted}
									>
										-
									</button>
								</div>
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
			{replyMode && (
				<ReplyForm
					comment={commentReplyingTo}
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
						onClick={deleteReply}
					>
						Yes, delete
					</Button>
				</div>
			</Modal>
		</>
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
