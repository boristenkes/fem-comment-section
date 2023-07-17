import { createContext } from 'react';
import { useAxios, useCookie, useFetch } from '../hooks';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
	const cookie = useCookie('user');
	const [dbUsers, usersFetchError, usersLoading] = useAxios('/users');
	const [dbComments, commentsFetchError, commentsLoading] =
		useAxios('/comments');
	const currentUser = dbUsers.find(user => user.id === cookie.read());

	return (
		<DataContext.Provider
			value={{
				dbUsers,
				usersFetchError,
				usersLoading,
				currentUser,
				dbComments,
				commentsFetchError,
				commentsLoading
			}}
		>
			{children}
		</DataContext.Provider>
	);
};

export default DataContext;
