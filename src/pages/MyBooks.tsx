import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {bookConverter } from '../types/bookModel.ts';


interface Book {
    title: string;
    author: string;
    coverPageLink: string;
}

const MyBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    return (
        <div style={{ padding: '32px' }}>
            <h1>My Books</h1>
            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {books.map((book, i) => (
                        <div key={i} style={{ width: 160, textAlign: 'center' }}>
                            {book.coverPageLink ? (
                                <img src={book.coverPageLink} alt={book.title} style={{ width: '100%', borderRadius: '8px' }} />
                            ) : (
                                <div style={{ width: '100%', height: '240px', background: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No Cover</div>
                            )}
                            <div>{book.title}</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>{book.author}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBooks;
