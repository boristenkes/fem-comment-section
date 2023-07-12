import { useAuth } from '../../helpers';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCookie, useFetch } from '../../hooks';
import './Comments.scss';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Loader, Button } from '../../components';
import api from '../../api';
import defaultAvatar from '../../assets/images/default.webp';
import Comment from './Comment';

// const comments = [
// 	{
// 		id: '1',
// 		content:
// 			"Impressive! Though it @seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
// 		createdAt: '04-Jul-2022 22:07',
// 		upvotes: 112321323,
// 		authorId: '2',
// 		replies: ''
// 	},
// 	{
// 		id: '2',
// 		content:
// 			"Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
// 		createdAt: '11-Dec-2021 09:17',
// 		upvotes: 42142,
// 		authorId: '1',
// 		replies: ''
// 	},
// 	{
// 		id: '3',
// 		content:
// 			"Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
// 		createdAt: '25-Feb-2021 20:05',
// 		upvotes: 123,
// 		authorId: '3',
// 		replies: ''
// 	}
// ];
dayjs.extend(relativeTime);

export default function Comments() {
	const isLoggedIn = useAuth();
	const cookie = useCookie('user');
	const navigate = useNavigate();
	const currentUserId = cookie.read();
	const [commentContent, setCommentContent] = useState('');

	const [dbComments, commentsFetchError, commentsLoading] =
		useFetch('/comments');
	const [pageComments, setPageComments] = useState(dbComments);
	const [dbUsers, usersFetchError, usersLoading] = useFetch('/users');
	const currentUser = dbUsers.find(user => user.id === currentUserId);

	useEffect(() => setPageComments(dbComments), [dbComments]);

	const logout = () => {
		cookie.destroy();
		navigate('/login');
	};

	const addComment = e => {
		e.preventDefault();
		if (!commentContent) return;

		const currentTime = dayjs().format('DD-MMM-YYYY HH:mm');
		// console.log(dayjs().format('DD-MMM-YYYY HH:mm'));

		const commentData = {
			authorId: currentUserId,
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
		<main className='comment-section'>
			{commentsLoading ? (
				<Loader />
			) : (
				<>
					{pageComments.map(comment => (
						<Comment
							key={`comment-${comment.id}`}
							data={comment}
							author={dbUsers.find(user => user.id === comment.authorId)}
							currentUserId={currentUserId}
							setPageComments={setPageComments}
						/>
					))}
					<button onClick={logout}>Logout</button>
					<form
						className='comment-form'
						onSubmit={addComment}
					>
						<img
							className='comment-avatar'
							width='50'
							height='50'
							src={currentUser?.avatar || defaultAvatar}
							alt={currentUser?.username}
						/>
						<textarea
							className='comment-form-content'
							value={commentContent}
							onChange={e => setCommentContent(e.target.value)}
							placeholder='Add a comment...'
							maxLength={10000}
						></textarea>
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
	);
}
