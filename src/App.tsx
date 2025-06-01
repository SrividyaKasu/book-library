import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import MyBooks from './pages/MyBooks';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Signup />} />
                <Route path="/my-books" element={<MyBooks />} />
            </Routes>
        </Router>
    );
};

export default App;
