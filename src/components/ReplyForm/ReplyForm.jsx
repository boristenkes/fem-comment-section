import React, { useContext, useState } from 'react';
import { Button } from '../../components';
import './ReplyForm.scss';
import DataContext from '../../context/DataContext';
import dayjs from 'dayjs';
import api from '../../api';
import { v4 as uuid } from 'uuid';

export default function ReplyForm({
	comment,
	commentAuthor,
	setReplies,
	setReplyMode
}) {
	const { currentUser } = useContext(DataContext);
	const [replyContent, setReplyContent] = useState(
		`@${commentAuthor?.username || 'DeletedUser'} `
	);

	const reply = () => {
		if (!replyContent.trim()) return;

		const currentTime = dayjs().format('DD-MMM-YYYY HH:mm');

		const newReply = {
			id: uuid(),
			authorId: currentUser.id,
			content: replyContent,
			createdAt: currentTime,
			upvotes: 0
		};

		let updatedReplies = [];
		setReplies(prevReplies => {
			updatedReplies = [...prevReplies, newReply];
			return updatedReplies;
		});

		api.put(`/comments/${comment.id}`, { replies: updatedReplies });
		setReplyMode(false);
	};

	return (
		<form
			onSubmit={reply}
			className='comment'
		>
			<img
				src={currentUser.avatar}
				alt={currentUser.username}
				className='comment-avatar'
				width={50}
				height={50}
			/>
			<textarea
				className='comment-form-content'
				value={replyContent}
				onChange={e => setReplyContent(e.target.value)}
				autoFocus
			/>
			<Button
				variant='contained'
				type='submit'
			>
				Reply
			</Button>
		</form>
	);
}
