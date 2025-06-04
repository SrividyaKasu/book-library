import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { borrowBooks, subscribeToBooks, fetchUserBorrowedBooks, type Book } from '../utils/borrowService';

const MyBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<string[]>([]);
    const [borrowing, setBorrowing] = useState(false);
    const [borrowedBooks, setBorrowedBooks] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Filter books based on search query
    const filteredBooks = books.filter(book => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        // Debug log to check book data
        console.log('Filtering book:', {
            title: book.title,
            author: book.author,
            query: query,
            titleMatch: book.title?.toLowerCase().includes(query),
            authorMatch: book.author?.toLowerCase().includes(query)
        });

        // Safely handle potentially undefined values and add null checks
        const title = (book.title || '').toLowerCase();
        const author = (book.author || '').toLowerCase();
        
        return title.includes(query) || author.includes(query);
    });

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/');
            return;
        }

        // Subscribe to real-time book updates
        const unsubscribe = subscribeToBooks((updatedBooks) => {
            // Debug log to check incoming book data
            console.log('Received books:', updatedBooks.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                isAvailable: book.isAvailable
            })));
            setBooks(updatedBooks);
            setLoading(false);
        });

        // Fetch user's currently borrowed books
        const fetchBorrowedBooks = async () => {
            if (auth.currentUser) {
                const borrowed = await fetchUserBorrowedBooks(auth.currentUser.uid);
                setBorrowedBooks(borrowed.map(book => book.id));
            }
        };
        fetchBorrowedBooks();

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [navigate]);

    const handleAddToCart = (bookId: string) => {
        const book = books.find(b => b.id === bookId);
        if (!book?.isAvailable) {
            return; // Don't add if book is not available
        }
        
        setCartItems(prev => {
            if (prev.includes(bookId)) {
                return prev.filter(id => id !== bookId);
            }
            return [...prev, bookId];
        });
    };

    const handleBorrowBooks = async () => {
        if (cartItems.length === 0 || !auth.currentUser) return;
        
        // Filter out any books that might have become unavailable
        const availableCartItems = cartItems.filter(id => {
            const book = books.find(b => b.id === id);
            return book?.isAvailable;
        });

        if (availableCartItems.length === 0) {
            alert('Selected books are no longer available.');
            setCartItems([]);
            return;
        }

        if (availableCartItems.length !== cartItems.length) {
            alert('Some selected books are no longer available and have been removed from your cart.');
            setCartItems(availableCartItems);
        }
        
        setBorrowing(true);
        try {
            await borrowBooks(auth.currentUser.uid, availableCartItems);
            setCartItems([]); // Clear cart after successful borrow
            
            // Update borrowed books list
            const borrowed = await fetchUserBorrowedBooks(auth.currentUser.uid);
            setBorrowedBooks(borrowed.map(book => book.id));
            
            alert('Books borrowed successfully! They are due in 14 days.');
        } catch (error) {
            console.error('Error borrowing books:', error);
            alert('Failed to borrow books. Please try again.');
        } finally {
            setBorrowing(false);
        }
    };

    const pageStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
    };

    const headerStyle: React.CSSProperties = {
        marginBottom: '24px',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1e293b',
    };

    const booksGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '24px',
        padding: '8px 0',
    };

    const bookCardStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '360px',
    };

    const bookCoverStyle: React.CSSProperties = {
        width: '100%',
        aspectRatio: '2/3',
        borderRadius: '8px',
        marginBottom: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease',
        objectFit: 'cover',
    };

    const bookInfoStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '48px',
        width: '100%',
    };

    const bookTitleStyle: React.CSSProperties = {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1e293b',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.3',
    };

    const bookAuthorStyle: React.CSSProperties = {
        fontSize: '13px',
        color: '#64748b',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
        fontWeight: '500',
    };

    const noCoverStyle: React.CSSProperties = {
        ...bookCoverStyle,
        background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        color: '#64748b',
    };

    const addToCartButtonStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        padding: '10px 16px',
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        opacity: 0,
        width: 'calc(100% - 24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
    };

    const cartButtonStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '14px 28px',
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    };

    const searchContainerStyle: React.CSSProperties = {
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    };

    const searchInputStyle: React.CSSProperties = {
        flex: '1',
        maxWidth: '400px',
        padding: '12px 16px',
        fontSize: '16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
    };

    const searchIconStyle: React.CSSProperties = {
        color: '#64748b',
        fontSize: '20px',
    };

    const noResultsStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '48px',
        color: '#64748b',
        fontSize: '16px',
    };

    return (
        <>
            <Navbar />
            <div style={pageStyle}>
                <h1 style={headerStyle}>My Books</h1>
                
                {/* Search Bar */}
                <div style={searchContainerStyle}>
                    <span style={searchIconStyle}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            ...searchInputStyle,
                            borderColor: searchQuery ? '#2563eb' : '#e2e8f0',
                        }}
                        onFocus={(e) => {
                            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                            e.target.style.borderColor = '#2563eb';
                        }}
                        onBlur={(e) => {
                            e.target.style.boxShadow = 'none';
                            e.target.style.borderColor = searchQuery ? '#2563eb' : '#e2e8f0';
                        }}
                    />
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div style={booksGridStyle}>
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                    <div 
                                        key={book.id} 
                                        style={{
                                            ...bookCardStyle,
                                            opacity: book.isAvailable ? 1 : 0.6,
                                            cursor: book.isAvailable ? 'pointer' : 'default'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!book.isAvailable) return;
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.1)';
                                            const coverImg = e.currentTarget.querySelector('img');
                                            const button = e.currentTarget.querySelector('button');
                                            if (coverImg) {
                                                coverImg.style.transform = 'scale(1.05)';
                                            }
                                            if (button) {
                                                button.style.opacity = '1';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!book.isAvailable) return;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                            const coverImg = e.currentTarget.querySelector('img');
                                            const button = e.currentTarget.querySelector('button');
                                            if (coverImg) {
                                                coverImg.style.transform = 'scale(1)';
                                            }
                                            if (button && !cartItems.includes(book.id)) {
                                                button.style.opacity = '0';
                                            }
                                        }}
                                    >
                                        {book.coverPageLink ? (
                                            <img 
                                                src={book.coverPageLink} 
                                                alt={book.title} 
                                                style={bookCoverStyle}
                                            />
                                        ) : (
                                            <div style={noCoverStyle}>
                                                📚
                                            </div>
                                        )}
                                        <div style={bookInfoStyle}>
                                            <div style={bookTitleStyle} title={book.title}>{book.title}</div>
                                            <div style={bookAuthorStyle} title={book.author}>by {book.author}</div>
                                        </div>
                                        {!book.isAvailable && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                backgroundColor: '#dc2626',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                            }}>
                                                {borrowedBooks.includes(book.id) ? 'You borrowed this' : 'Borrowed'}
                                            </div>
                                        )}
                                        {book.isAvailable && (
                                            <button
                                                style={{
                                                    ...addToCartButtonStyle,
                                                    opacity: cartItems.includes(book.id) ? 1 : 0,
                                                    background: cartItems.includes(book.id)
                                                        ? '#dc2626'
                                                        : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(book.id);
                                                }}
                                            >
                                                {cartItems.includes(book.id) ? (
                                                    <>
                                                        <span style={{ fontSize: '14px' }}>❌</span>
                                                        Remove
                                                    </>
                                                ) : (
                                                    <>
                                                        <span style={{ fontSize: '14px' }}>📚</span>
                                                        Borrow
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={noResultsStyle}>
                                    {searchQuery ? (
                                        <>
                                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
                                            No books found matching "{searchQuery}"
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
                                            No books available
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        {cartItems.length > 0 && (
                            <button 
                                style={{
                                    ...cartButtonStyle,
                                    opacity: borrowing ? 0.7 : 1,
                                    cursor: borrowing ? 'not-allowed' : 'pointer',
                                    background: borrowing 
                                        ? '#2563eb' 
                                        : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                }}
                                onClick={handleBorrowBooks}
                                disabled={borrowing}
                                onMouseOver={(e) => {
                                    if (borrowing) return;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    if (borrowing) return;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.1)';
                                }}
                            >
                                {borrowing ? (
                                    <>
                                        <span style={{ fontSize: '18px' }}>⏳</span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '18px' }}>📚</span>
                                        Borrow {cartItems.length} {cartItems.length === 1 ? 'book' : 'books'}
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default MyBooks;
