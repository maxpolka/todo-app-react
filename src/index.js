import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import reportWebVitals from './reportWebVitals';
import "antd/dist/reset.css";
import { Provider } from 'react-redux';
import { store } from './app/store.ts';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
