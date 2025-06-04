import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Signup from './pages/Signup';
import MyBooks from './pages/MyBooks';
import AddBook from './pages/AddBook';
import LoadBooks from './pages/LoadBooks';
import BorrowedBooks from './pages/BorrowedBooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthenticated(!!user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Signup />} />
                <Route 
                    path="/my-books" 
                    element={
                        <ProtectedRoute>
                            <MyBooks />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/add-book" 
                    element={
                        <ProtectedRoute>
                            <AddBook />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/load-books" 
                    element={
                        <ProtectedRoute>
                            <LoadBooks />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/borrowed" 
                    element={
                        <ProtectedRoute>
                            <BorrowedBooks />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;
