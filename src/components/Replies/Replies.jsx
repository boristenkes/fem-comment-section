import { useContext } from 'react';
import DataContext from '../../context/DataContext';
import Reply from './Reply';

export default function Replies({ replyTo, replies, setReplies }) {
	const { dbUsers } = useContext(DataContext);

	return (
		<div className='comment-reply-wrapper'>
			<div className='comment-section'>
				{replies.map(reply => (
					<Reply
						key={reply.id}
						replyTo={replyTo}
						data={reply}
						author={
							dbUsers.find(user => user.id === reply.authorId) || 'Deleted User'
						}
						setReplies={setReplies}
					/>
				))}
			</div>
		</div>
	);
}
