import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';


interface Book {
    title: string;
    author: string;
    coverPageLink: string;
}

const AddBook = () => {
    const [query, setQuery] = useState('');
    const [foundBook, setFoundBook] = useState<Book | null>(null);
    const [status, setStatus] = useState('');

    const handleSearch = async () => {
        setStatus('Searching...');
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}`);
            const data = await res.json();
            const info = data.items?.[0]?.volumeInfo;
            if (info) {
                setFoundBook({
                    title: info.title,
                    author: info.authors?.[0] || 'Unknown',
                    coverPageLink: info.imageLinks?.thumbnail || '',
                });
                setStatus('');
            } else {
                setFoundBook(null);
                setStatus('No book found');
            }
        } catch {
            setStatus('Error searching for book');
        }
    };

    const handleAdd = async () => {
        if (!foundBook) return;
        try {
            await addDoc(collection(db, 'books'), foundBook);
            setStatus('✅ Book added');
            setQuery('');
            setFoundBook(null);
        } catch {
            setStatus('❌ Failed to add');
        }
    };

    return (
        <div style={{ padding: 32, textAlign: 'center' }}>
            <h1>Add a Book</h1>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter title" />
            <button onClick={handleSearch}>Search</button>
            <p>{status}</p>
            {foundBook && (
                <div style={{ marginTop: 24 }}>
                    {foundBook.coverPageLink && <img src={foundBook.coverPageLink} alt={foundBook.title} style={{ width: 160 }} />}
                    <h3>{foundBook.title}</h3>
                    <p>{foundBook.author}</p>
                    <button onClick={handleAdd}>Add to My Books</button>
                </div>
            )}
        </div>
    );
};

export default AddBook;
