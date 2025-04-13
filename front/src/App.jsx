import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Add from './Add';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Ajouter from './Ajouter';
import Update from './Update';
import Profile from './Profile';
import Register from './Register';

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/add"
                    element={
                        <PrivateRoute>
                            <Add />
                        </PrivateRoute>
                    }
                />
                <Route path='/create' element= { <Ajouter/>}></Route>
                <Route path='/update/:numApp' element= { <Update/>}></Route>
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
