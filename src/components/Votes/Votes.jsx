import { useContext, useEffect, useState } from 'react';
import api from '../../api';
import DataContext from '../../context/DataContext';

export default function Votes({ comment }) {
	const { currentUser } = useContext(DataContext);
	const [upvotedComments, setUpvotedComments] = useState(
		currentUser?.upvotedComments || []
	);
	const [downvotedComments, setDownvotedComments] = useState(
		currentUser?.downvotedComments || []
	);
	const [isUpvoted, setIsUpvoted] = useState(
		upvotedComments?.includes(comment.id)
	);
	const [isDownvoted, setIsDownvoted] = useState(
		downvotedComments?.includes(comment.id)
	);
	const [votes, setVotes] = useState(comment.upvotes);

	useEffect(() => {
		setIsUpvoted(upvotedComments?.includes(comment.id));
		setIsDownvoted(downvotedComments?.includes(comment.id));
	}, [upvotedComments, downvotedComments]);

	useEffect(() => {
		setUpvotedComments(currentUser?.upvotedComments || []);
		setDownvotedComments(currentUser?.downvotedComments || []);
	}, [currentUser]);

	const handleVote = async (
		newUpvotedComments,
		newDownvotedComments,
		newVotes
	) => {
		try {
			await api.put(`/users/${currentUser.id}`, {
				upvotedComments: newUpvotedComments,
				downvotedComments: newDownvotedComments
			});

			await api.put(`/comments/${comment.id}`, { upvotes: newVotes });
		} catch (error) {
			console.error('Error updating database:', error);
		}
	};

	const upvote = () => {
		let newVotes = votes;
		let newUpvotedComments = upvotedComments;
		let newDownvotedComments = downvotedComments;

		if (currentUser) {
			if (isUpvoted) {
				// Remove comment from upvoted comments
				newUpvotedComments = newUpvotedComments.filter(id => id !== comment.id);
				// Remove one vote
				newVotes--;
			} else if (isDownvoted) {
				// Add comment to upvoted comments
				newUpvotedComments = [...newUpvotedComments, comment.id];
				// Remove comment from downvoted comments
				newDownvotedComments = newDownvotedComments.filter(
					id => id !== comment.id
				);
				// Add one vote for removing downvote, and one for upvoting
				newVotes += 2;
			} else {
				// Add comment to upvoted comments
				newUpvotedComments = [...newUpvotedComments, comment.id];
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
					id => id !== comment.id
				);
				// Remove one vote
				newVotes++;
			} else if (isUpvoted) {
				// Add comment to downvoted comments
				newDownvotedComments = [...newDownvotedComments, comment.id];
				// Remove comment from upvoted comments
				newUpvotedComments = newUpvotedComments.filter(id => id !== comment.id);
				// Remove one vote for removing upvote, and one for downvoting
				newVotes -= 2;
			} else {
				// Add comment to downvoted comments
				newDownvotedComments = [...newDownvotedComments, comment.id];
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
		<div className='comment-upvotes'>
			<button
				className='comment-upvotes-button'
				data-active={isUpvoted}
				onClick={upvote}
			>
				+
			</button>
			<span className='comment-upvotes-value | text-primary-500 fw-bold'>
				{beautifyNumber(votes)}
			</span>
			<button
				className='comment-upvotes-button'
				data-active={isDownvoted}
				onClick={downvote}
			>
				-
			</button>
		</div>
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
