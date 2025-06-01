import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import MyBooks from './pages/MyBooks';
import AddBook from './pages/AddBook';
import LoadBooks from './pages/LoadBooks';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Signup />} />
                <Route path="/my-books" element={<MyBooks />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/load-books" element={<LoadBooks />} />
            </Routes>
        </Router>
    );
};

export default App;
