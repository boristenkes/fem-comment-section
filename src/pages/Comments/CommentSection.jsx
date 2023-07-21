import { useAuth } from '../../helpers';
import { Navigate } from 'react-router-dom';
import './Comments.scss';
import { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Loader, Button, UserMenu } from '../../components';
import api from '../../api';
import defaultAvatar from '../../assets/images/default.webp';
import Comment from './Comment';
import DataContext from '../../context/DataContext';

dayjs.extend(relativeTime);

export default function CommentSection() {
	const isLoggedIn = useAuth();
	const [commentContent, setCommentContent] = useState('');
	const maxLength = 10000;

	const { dbComments, commentsLoading, dbUsers, currentUser } =
		useContext(DataContext);

	const [pageComments, setPageComments] = useState(dbComments);
	useEffect(() => setPageComments(dbComments), [dbComments]);

	const addComment = e => {
		e.preventDefault();
		if (!commentContent) return;

		const currentTime = dayjs().format('DD-MMM-YYYY HH:mm:ss');
		// console.log(dayjs().format('DD-MMM-YYYY HH:mm'));

		const commentData = {
			authorId: currentUser.id,
			content: commentContent,
			createdAt: currentTime,
			upvotes: 0,
			replies: []
		};

		api.post('/comments', commentData).then(resp => {
			setPageComments(prevComments => [...prevComments, resp.data]);
			setCommentContent('');
		});
	};

	return !isLoggedIn ? (
		<Navigate
			to='/login'
			replace
		/>
	) : (
		<>
			<UserMenu />
			<main className='comment-section'>
				{commentsLoading ? (
					<Loader />
				) : (
					<>
						{pageComments.map(comment => (
							<Comment
								key={`comment-${comment.id}`}
								data={comment}
								author={
									dbUsers.find(user => user.id === comment.authorId) ||
									'Deleted User'
								}
								setPageComments={setPageComments}
							/>
						))}
						<form
							className='comment-form'
							onSubmit={addComment}
						>
							<img
								className='comment-avatar'
								width={50}
								height={50}
								src={currentUser?.avatar || defaultAvatar}
								alt={currentUser?.username}
							/>
							<textarea
								className='comment-form-content'
								value={commentContent}
								onChange={e => setCommentContent(e.target.value)}
								placeholder='Add a comment...'
								maxLength={10000}
							/>
							<Button
								type='submit'
								variant='contained'
							>
								Send
							</Button>
						</form>
					</>
				)}
			</main>
		</>
	);
}
