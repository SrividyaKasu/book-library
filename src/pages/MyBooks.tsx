import React from 'react';
import books from '../data/books.json';

const MyBooks = () => {
    return (
        <div style={styles.page}>
            <h1 style={styles.heading}>My Books</h1>
            <div style={styles.tabs}>
                <span style={{ ...styles.tab, ...styles.tabActive }}>All</span>
                <span style={styles.tab}>Reading</span>
                <span style={styles.tab}>Finished</span>
            </div>
            <div style={styles.grid}>
                {books.map((book, index) => (
                    <div key={index} style={styles.card}>
                        <img
                            src={book.coverPageLink}
                            alt={book.name}
                            style={styles.cover}
                        />
                        <div style={styles.title}>{book.title}</div>
                        <div style={styles.author}>{book.author}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        fontFamily: 'Arial, sans-serif',
        padding: '32px',
    },
    heading: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '16px',
    },
    tabs: {
        display: 'flex',
        gap: '24px',
        marginBottom: '16px',
        fontWeight: 'bold',
    },
    tab: {
        cursor: 'pointer',
        color: '#666',
    },
    tabActive: {
        color: '#000',
        borderBottom: '2px solid #000',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
    },
    card: {
        width: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    cover: {
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
        marginTop: '8px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    author: {
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
    },
};

export default MyBooks;
