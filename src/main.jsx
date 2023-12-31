import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import './scss/styles.scss';
import './helpers/prototypes.jsx';
import { DataProvider } from './context/DataContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<HashRouter>
			<DataProvider>
				<App />
			</DataProvider>
		</HashRouter>
	</React.StrictMode>
);
