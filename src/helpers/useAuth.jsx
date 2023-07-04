import { useCookie } from '../hooks';

export default function useAuth() {
	const userId = useCookie({
		key: 'user'
	});
	const isLoggedIn = !!userId;

	return isLoggedIn;
}
