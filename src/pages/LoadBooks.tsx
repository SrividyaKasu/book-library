import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import {bookConverter } from '../types/bookModel.ts';
import bookData from '../data/books.json';

interface Book {
    title: string;
    author: string;
    coverPageLink: string;
}

const LoadBooks: React.FC = () => {
    const [status, setStatus] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);

    const isValidBook = (book: any): book is Book =>
        typeof book?.title === 'string' && typeof book?.author === 'string';

    const handleLoadBooks = async () => {
        setStatus('Loading books...');
        setErrorList([]);

        try {
            const booksRef = collection(db, 'books').withConverter(bookConverter);
            const validBooks = bookData.filter(isValidBook);
            const errors = bookData
                .map((book, i) => (!isValidBook(book) ? `Invalid book at index ${i}` : null))
                .filter(Boolean) as string[];

            if (!validBooks.length) {
                setStatus('No valid books to upload.');
                setErrorList(errors);
                return;
            }

            await Promise.all(validBooks.map(book => addDoc(booksRef, book)));
            setStatus(`Uploaded ${validBooks.length} book(s).`);
            setErrorList(errors);
        } catch (err: any) {
            console.error(err);
            setStatus(`Upload failed: ${err.message}`);
        }
    };

    return (
        <div>
            <h2>Load Books from JSON</h2>
            <button onClick={handleLoadBooks}>Load</button>
            <p>{status}</p>
            {errorList.length > 0 && (
                <ul style={{ color: 'red' }}>
                    {errorList.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            )}
        </div>
    );
};

export default LoadBooks;
