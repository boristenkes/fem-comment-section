import { useAuth } from '../../helpers';
import { Navigate } from 'react-router-dom';

export default function Comments() {
	const isLoggedIn = useAuth();

	return !isLoggedIn ? (
		<Navigate
			to='/login'
			replace
		/>
	) : (
		<h1>Comments</h1>
	);
}
