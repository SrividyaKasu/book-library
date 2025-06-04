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
        
        const title = (book.title || '').toLowerCase();
        const author = (book.author || '').toLowerCase();
        
        return title.includes(query) || author.includes(query);
    });

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/');
            return;
        }

        const unsubscribe = subscribeToBooks((updatedBooks) => {
            setBooks(updatedBooks);
            setLoading(false);
        });

        const fetchBorrowedBooks = async () => {
            if (auth.currentUser) {
                const borrowed = await fetchUserBorrowedBooks(auth.currentUser.uid);
                setBorrowedBooks(borrowed.map(book => book.id));
            }
        };
        fetchBorrowedBooks();

        return () => unsubscribe();
    }, [navigate]);

    const handleAddToCart = (bookId: string) => {
        const book = books.find(b => b.id === bookId);
        if (!book?.isAvailable) return;
        
        setCartItems(prev => {
            if (prev.includes(bookId)) {
                return prev.filter(id => id !== bookId);
            }
            return [...prev, bookId];
        });
    };

    const handleBorrowBooks = async () => {
        if (cartItems.length === 0 || !auth.currentUser) return;
        
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
            setCartItems([]);
            
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
        minHeight: '100vh',
        background: '#ffffff',
    };

    const contentStyle: React.CSSProperties = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 32px',
    };

    const headerContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px',
        gap: '24px',
        flexWrap: 'wrap',
    };

    const headerStyle: React.CSSProperties = {
        fontSize: '32px',
        fontWeight: '700',
        color: '#2d3748',
        margin: 0,
    };

    const searchContainerStyle: React.CSSProperties = {
        position: 'relative',
        flex: '1',
        maxWidth: '400px',
        minWidth: '280px',
    };

    const searchInputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        paddingLeft: '44px',
        fontSize: '15px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: '#fff',
    };

    const searchIconStyle: React.CSSProperties = {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#a0aec0',
        fontSize: '18px',
        pointerEvents: 'none',
    };

    const booksGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '24px',
        padding: '8px 0',
    };

    const bookCardStyle: React.CSSProperties = {
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
    };

    const bookCoverContainerStyle: React.CSSProperties = {
        position: 'relative',
        paddingTop: '140%',
        backgroundColor: '#f7fafc',
        overflow: 'hidden',
    };

    const bookCoverStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    };

    const bookInfoStyle: React.CSSProperties = {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexGrow: 1,
        minHeight: '104px',
        position: 'relative',
    };

    const bookTitleStyle: React.CSSProperties = {
        fontSize: '15px',
        fontWeight: '600',
        color: '#2d3748',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.4',
        margin: 0,
    };

    const bookAuthorStyle: React.CSSProperties = {
        fontSize: '14px',
        color: '#718096',
        margin: '0 0 auto 0',
    };

    const borrowedStatusStyle: React.CSSProperties = {
        fontSize: '14px',
        color: '#718096',
        padding: '8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    const borrowButtonStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        marginTop: 'auto',
    };

    const noCoverStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '32px',
        backgroundColor: '#f7fafc',
        color: '#a0aec0',
    };

    const borrowAllButtonStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        padding: '16px 32px',
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
        transition: 'all 0.3s ease',
    };

    const noResultsStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '48px',
        color: '#718096',
        backgroundColor: '#f7fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    };

    const statusBadgeStyle: React.CSSProperties = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white',
        backgroundColor: '#4299e1',
        boxShadow: '0 2px 4px rgba(66, 153, 225, 0.2)',
        zIndex: 1,
    };

    return (
        <>
            <Navbar />
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <div style={headerContainerStyle}>
                        <h1 style={headerStyle}>My Books</h1>
                        <div style={searchContainerStyle}>
                            <span style={searchIconStyle}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by title or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    ...searchInputStyle,
                                    borderColor: searchQuery ? '#4299e1' : '#e2e8f0',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4299e1';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)';
                                }}
                                onBlur={(e) => {
                                    if (!searchQuery) {
                                        e.target.style.borderColor = '#e2e8f0';
                                    }
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={noResultsStyle}>
                            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
                            Loading your library...
                        </div>
                    ) : (
                        <>
                            <div style={booksGridStyle}>
                                {filteredBooks.length > 0 ? (
                                    filteredBooks.map((book) => (
                                        <div 
                                            key={book.id} 
                                            style={{
                                                ...bookCardStyle,
                                                opacity: book.isAvailable ? 1 : 0.7,
                                                cursor: book.isAvailable ? 'pointer' : 'default',
                                            }}
                                            onMouseOver={(e) => {
                                                if (!book.isAvailable) return;
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                                                const coverImg = e.currentTarget.querySelector('img');
                                                if (coverImg) {
                                                    (coverImg as HTMLElement).style.transform = 'scale(1.05)';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (!book.isAvailable) return;
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                const coverImg = e.currentTarget.querySelector('img');
                                                if (coverImg) {
                                                    (coverImg as HTMLElement).style.transform = 'scale(1)';
                                                }
                                            }}
                                        >
                                            <div style={bookCoverContainerStyle}>
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
                                                {!book.isAvailable && (
                                                    <div style={{
                                                        ...statusBadgeStyle,
                                                        backgroundColor: borrowedBooks.includes(book.id) 
                                                            ? '#48bb78' 
                                                            : '#e53e3e',
                                                    }}>
                                                        {borrowedBooks.includes(book.id) ? 'You borrowed this' : 'Borrowed'}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={bookInfoStyle}>
                                                <h3 style={bookTitleStyle}>{book.title}</h3>
                                                <p style={bookAuthorStyle}>by {book.author}</p>
                                                {book.isAvailable ? (
                                                    <button
                                                        style={{
                                                            ...borrowButtonStyle,
                                                            backgroundColor: cartItems.includes(book.id)
                                                                ? '#fed7d7'
                                                                : '#ebf8ff',
                                                            color: cartItems.includes(book.id)
                                                                ? '#e53e3e'
                                                                : '#4299e1',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(book.id);
                                                        }}
                                                    >
                                                        {cartItems.includes(book.id) ? (
                                                            <>
                                                                <span>❌</span>
                                                                Remove
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>📚</span>
                                                                Borrow
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div style={borrowedStatusStyle}>
                                                        <span style={{ fontSize: '16px' }}>
                                                            {borrowedBooks.includes(book.id) ? '📖' : '⏳'}
                                                        </span>
                                                        {borrowedBooks.includes(book.id) 
                                                            ? 'Currently reading'
                                                            : 'Not available'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={noResultsStyle}>
                                        <div style={{ fontSize: '24px', marginBottom: '16px' }}>📚</div>
                                        {searchQuery ? (
                                            <>No books found matching "{searchQuery}"</>
                                        ) : (
                                            <>No books available</>
                                        )}
                                    </div>
                                )}
                            </div>
                            {cartItems.length > 0 && (
                                <button 
                                    style={{
                                        ...borrowAllButtonStyle,
                                        opacity: borrowing ? 0.7 : 1,
                                        cursor: borrowing ? 'not-allowed' : 'pointer',
                                    }}
                                    onClick={handleBorrowBooks}
                                    disabled={borrowing}
                                    onMouseOver={(e) => {
                                        if (borrowing) return;
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(66, 153, 225, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        if (borrowing) return;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(66, 153, 225, 0.2)';
                                    }}
                                >
                                    {borrowing ? (
                                        <>
                                            <span style={{ fontSize: '20px' }}>⏳</span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '20px' }}>📚</span>
                                            Borrow {cartItems.length} {cartItems.length === 1 ? 'book' : 'books'}
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyBooks;
