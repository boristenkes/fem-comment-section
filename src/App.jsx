import { Login, Comments } from './pages';
import { Routes, Route } from 'react-router-dom';

export default function App() {
	return (
		<Routes>
			<Route
				index
				element={<Comments />}
			/>
			<Route
				path='/login'
				element={<Login />}
			/>
		</Routes>
	);
}