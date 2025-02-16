import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    const isAuthenticated = token !== null;
    
    console.log('PrivateRoute check:', { isAuthenticated, hasToken: !!token });
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute; 