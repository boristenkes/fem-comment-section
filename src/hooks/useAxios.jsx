import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';

export default function useAxios(endpoint) {
	const [data, setData] = useState([]);
	const [fetchError, setFetchError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const source = axios.CancelToken.source();

		(async () => {
			setIsLoading(true);
			try {
				const response = await api.get(endpoint, {
					cancelToken: source.token
				});
				if (isMounted) {
					setData(response.data);
					setFetchError(null);
				}
			} catch (err) {
				if (isMounted) {
					setFetchError(err.message);
					setData([]);
				}
			} finally {
				isMounted && setIsLoading(false);
			}
		})();

		// const fetchData = async url => {
		// 	setIsLoading(true);
		// 	try {
		// 		const response = await axios.get(url, {
		// 			cancelToken: source.token
		// 		});
		// 		if (isMounted) {
		// 			setData(response.data);
		// 			setFetchError(null);
		// 		}
		// 	} catch (err) {
		// 		if (isMounted) {
		// 			setFetchError(err.message);
		// 			setData([]);
		// 		}
		// 	} finally {
		// 		isMounted && setIsLoading(false);
		// 	}
		// };

		// fetchData(API_URL + endpoint);

		const cleanUp = () => {
			isMounted = false;
			source.cancel();
		};

		return cleanUp;
	}, [endpoint]);

	return [data, fetchError, isLoading];
}
