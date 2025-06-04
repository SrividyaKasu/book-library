import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchUserBorrowedBooks, returnBook, type BorrowedBook } from '../utils/borrowService';

const BorrowedBooks: React.FC = () => {
    const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [returning, setReturning] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchBooks = async () => {
        try {
            const books = await fetchUserBorrowedBooks(auth.currentUser!.uid);
            setBorrowedBooks(books);
        } catch (error) {
            console.error('Error fetching borrowed books:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/');
            return;
        }

        fetchBooks();
    }, [navigate]);

    const handleReturnBook = async (transactionId: string, bookId: string) => {
        setReturning(bookId);
        try {
            await returnBook(transactionId, bookId);
            // Refresh the borrowed books list
            await fetchBooks();
            // Show success message
            alert('Book returned successfully!');
        } catch (error) {
            console.error('Error returning book:', error);
            // Show more specific error message
            if (error instanceof Error) {
                alert(`Failed to return book: ${error.message}`);
            } else {
                alert('Failed to return book. Please try again.');
            }
        } finally {
            setReturning(null);
        }
    };

    const pageStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        minHeight: '100vh',
    };

    const headerStyle: React.CSSProperties = {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '24px',
        color: '#1e293b',
    };

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    };

    const thStyle: React.CSSProperties = {
        padding: '16px',
        textAlign: 'left',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '14px',
        borderBottom: '1px solid #e2e8f0',
    };

    const tdStyle: React.CSSProperties = {
        padding: '16px',
        borderBottom: '1px solid #e2e8f0',
        color: '#1e293b',
        fontSize: '14px',
    };

    const bookInfoStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    };

    const bookCoverStyle: React.CSSProperties = {
        width: '48px',
        height: '72px',
        borderRadius: '4px',
        objectFit: 'cover',
    };

    const statusStyle = (dueDate: Date): React.CSSProperties => ({
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: isOverdue(dueDate) ? '#fee2e2' : '#e0f2fe',
        color: isOverdue(dueDate) ? '#dc2626' : '#0284c7',
    });

    const returnButtonStyle = (isReturning: boolean): React.CSSProperties => ({
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        cursor: isReturning ? 'not-allowed' : 'pointer',
        opacity: isReturning ? 0.7 : 1,
        transition: 'all 0.2s ease',
    });

    const isOverdue = (dueDate: Date): boolean => {
        return new Date() > new Date(dueDate);
    };

    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (dueDate: Date): string => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else {
            return `${diffDays} days remaining`;
        }
    };

    return (
        <>
            <Navbar />
            <div style={pageStyle}>
                <h1 style={headerStyle}>Borrowed Books</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : borrowedBooks.length > 0 ? (
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Book</th>
                                <th style={thStyle}>Borrowed Date</th>
                                <th style={thStyle}>Due Date</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrowedBooks.map((book) => (
                                <tr key={book.id}>
                                    <td style={tdStyle}>
                                        <div style={bookInfoStyle}>
                                            {book.coverPageLink ? (
                                                <img
                                                    src={book.coverPageLink}
                                                    alt={book.title}
                                                    style={bookCoverStyle}
                                                />
                                            ) : (
                                                <div style={{
                                                    ...bookCoverStyle,
                                                    backgroundColor: '#f1f5f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    📚
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{book.title}</div>
                                                <div style={{ color: '#64748b', fontSize: '13px' }}>by {book.author}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{formatDate(book.borrowDate)}</td>
                                    <td style={tdStyle}>{formatDate(book.dueDate)}</td>
                                    <td style={tdStyle}>
                                        <span style={statusStyle(book.dueDate)}>
                                            {getDaysRemaining(book.dueDate)}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            style={returnButtonStyle(returning === book.id)}
                                            onClick={() => handleReturnBook(book.transactionId, book.id)}
                                            disabled={returning === book.id}
                                            onMouseOver={(e) => {
                                                if (returning === book.id) return;
                                                e.currentTarget.style.backgroundColor = '#1d4ed8';
                                            }}
                                            onMouseOut={(e) => {
                                                if (returning === book.id) return;
                                                e.currentTarget.style.backgroundColor = '#2563eb';
                                            }}
                                        >
                                            {returning === book.id ? 'Returning...' : 'Return Book'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        color: '#64748b',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
                        <p>You haven't borrowed any books yet.</p>
                        <button
                            onClick={() => navigate('/my-books')}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                            }}
                        >
                            Browse Books
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default BorrowedBooks; 