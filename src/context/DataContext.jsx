import { createContext } from 'react';
import { useAxios, useCookie } from '../hooks';
import { useMediaQuery } from 'react-responsive';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
	const cookie = useCookie('user');
	const [dbUsers, usersFetchError, usersLoading] = useAxios('/users');
	const [dbComments, commentsFetchError, commentsLoading] =
		useAxios('/comments');
	const currentUser = dbUsers.find(user => user.id === cookie.read());
	const isBigScreen = useMediaQuery({ query: '(min-width: 600px)' });
	const formRules = {
		username: {
			required: true,
			noWhitespaces: true,
			noNumbers: false,
			noSpecials: true,
			allLower: false,
			allUpper: false,
			min: 3,
			max: 20
		},
		email: {
			required: true
		},
		password: {
			required: true,
			numbers: true,
			specialChars: true,
			upperAndLower: true,
			min: 5,
			max: 30
		},
		confirmPass: {
			required: true
		}
	};

	return (
		<DataContext.Provider
			value={{
				dbUsers,
				usersFetchError,
				usersLoading,
				currentUser,
				dbComments,
				commentsFetchError,
				commentsLoading,
				isBigScreen,
				formRules
			}}
		>
			{children}
		</DataContext.Provider>
	);
};

export default DataContext;
