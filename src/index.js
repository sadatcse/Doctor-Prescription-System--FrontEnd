import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Routes.jsx';
import AuthProvider from './providers/AuthProvider.jsx';
import { HelmetProvider } from 'react-helmet-async';

// 1. Toastify Imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- ADD THIS LINE!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={router}/>
        
        {/* 2. Container setup */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
         
        />  
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();