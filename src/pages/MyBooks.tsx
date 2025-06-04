import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { bookConverter } from '../types/bookModel.ts';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface Book {
    title: string;
    author: string;
    coverPageLink: string;
}

const MyBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        if (!auth.currentUser) {
            navigate('/');
            return;
        }

        const fetchBooks = async () => {
            try {
                const booksRef = collection(db, 'books').withConverter(bookConverter);
                const snapshot = await getDocs(booksRef);
                setBooks(snapshot.docs.map(doc => doc.data()));
            } catch (err) {
                console.error('Error fetching books:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [navigate]);

    const pageStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    };

    const headerStyle: React.CSSProperties = {
        marginBottom: '16px',
        fontSize: '24px',
        fontWeight: 'bold',
    };

    const booksGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '20px',
        padding: '8px 0',
    };

    const bookCardStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    };

    const bookCoverStyle: React.CSSProperties = {
        width: '100%',
        aspectRatio: '2/3',
        borderRadius: '6px',
        marginBottom: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };

    const bookTitleStyle: React.CSSProperties = {
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '2px',
        // Ensure title doesn't wrap to more than 2 lines
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.2',
    };

    const bookAuthorStyle: React.CSSProperties = {
        fontSize: '12px',
        color: '#666',
        // Ensure author doesn't wrap to more than 1 line
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
    };

    return (
        <>
            <Navbar />
            <div style={pageStyle}>
                <h1 style={headerStyle}>My Books</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={booksGridStyle}>
                        {books.map((book, i) => (
                            <div key={i} style={bookCardStyle}>
                                {book.coverPageLink ? (
                                    <img 
                                        src={book.coverPageLink} 
                                        alt={book.title} 
                                        style={bookCoverStyle}
                                    />
                                ) : (
                                    <div style={{
                                        ...bookCoverStyle,
                                        background: '#eee',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                    }}>
                                        No Cover
                                    </div>
                                )}
                                <div style={bookTitleStyle} title={book.title}>{book.title}</div>
                                <div style={bookAuthorStyle} title={book.author}>{book.author}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyBooks;
