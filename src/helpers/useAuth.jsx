import { useCookie } from '../hooks';

export default function useAuth() {
	const cookie = useCookie('user');
	const isLoggedIn = !!cookie.read();

	return isLoggedIn;
}
