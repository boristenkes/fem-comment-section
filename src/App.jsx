import { Login, CommentSection } from './pages';
import { Routes, Route } from 'react-router-dom';

export default function App() {
	return (
		<>
			<Routes>
				<Route
					path='/'
					element={<CommentSection />}
				/>
				<Route
					path='/login'
					element={<Login />}
				/>
			</Routes>
		</>
	);
}
