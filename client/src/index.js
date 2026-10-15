// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';

// import App from './App';
import reportWebVitals from './reportWebVitals';



// import { useState, useEffect } from 'react';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ← add this
import App from './app/App'
import './index.css'
import '../src/styles/globals.css'
import '../src/styles/typography.css';


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>   {/* ← wrap App here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register Service Worker for PWA (Progressive Web App) standalone fullscreen
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Moon IMS Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.warn('Moon IMS Service Worker registration failed:', error);
      });
  });
}

