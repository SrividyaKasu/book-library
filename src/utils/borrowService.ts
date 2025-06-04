import { db } from '../firebase';
import { 
    collection, 
    doc, 
    writeBatch, 
    serverTimestamp, 
    query, 
    where, 
    onSnapshot,
    getDocs,
    setDoc,
    getDoc,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

export interface Book {
    id: string;
    title: string;
    author: string;
    coverPageLink: string;
    isAvailable: boolean;
    lastBorrowDate?: Date;
}

export interface BorrowedBook extends Book {
    borrowDate: Date;
    dueDate: Date;
    transactionId: string;
}

interface BorrowTransaction {
    userId: string;
    bookId: string;
    borrowDate: Date;
    returnDate: Date | null;
    status: 'borrowed' | 'returned';
}

export const returnBook = async (transactionId: string, bookId: string): Promise<void> => {
    try {
        // First verify the transaction exists and is in borrowed state
        const transactionRef = doc(db, 'borrowTransactions', transactionId);
        const transactionDoc = await getDoc(transactionRef);
        
        if (!transactionDoc.exists()) {
            throw new Error('Transaction not found');
        }

        const transactionData = transactionDoc.data();
        if (transactionData.status !== 'borrowed') {
            throw new Error('Book is not in borrowed state');
        }

        // Verify the book exists
        const bookRef = doc(db, 'books', bookId);
        const bookDoc = await getDoc(bookRef);
        
        if (!bookDoc.exists()) {
            throw new Error('Book not found');
        }

        // Use a batch write to update both documents
        const batch = writeBatch(db);
        
        // Update transaction status
        batch.update(transactionRef, {
            status: 'returned',
            returnDate: serverTimestamp()
        });

        // Update book availability
        batch.update(bookRef, {
            isAvailable: true
        });

        // Commit the batch
        await batch.commit();
    } catch (error) {
        console.error('Error returning book:', error);
        throw error;
    }
};

export const borrowBooks = async (userId: string, bookIds: string[]): Promise<void> => {
    const batch = writeBatch(db);
    const borrowDate = new Date();
    
    // Calculate return date (e.g., 14 days from now)
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    try {
        // Create borrow transactions
        bookIds.forEach((bookId) => {
            const transactionRef = doc(collection(db, 'borrowTransactions'));
            const transaction: BorrowTransaction = {
                userId,
                bookId,
                borrowDate,
                returnDate,
                status: 'borrowed',
            };
            batch.set(transactionRef, {
                ...transaction,
                borrowDate: serverTimestamp(),
                returnDate: returnDate,
            });

            // Update book availability
            const bookRef = doc(db, 'books', bookId);
            batch.update(bookRef, {
                isAvailable: false,
                lastBorrowDate: serverTimestamp(),
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error borrowing books:', error);
        throw error;
    }
};

export const subscribeToBooks = (onUpdate: (books: Book[]) => void): Unsubscribe => {
    const booksRef = collection(db, 'books');
    
    // Create a real-time listener
    const unsubscribe = onSnapshot(booksRef, (snapshot) => {
        const books = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                author: data.author || '',
                coverPageLink: data.coverPageLink || '',
                isAvailable: data.isAvailable === undefined ? true : data.isAvailable,
                lastBorrowDate: data.lastBorrowDate ? new Date(data.lastBorrowDate.seconds * 1000) : undefined
            } as Book;
        });
        onUpdate(books);
    }, (error) => {
        console.error('Error listening to books:', error);
    });

    return unsubscribe;
};

// Helper function to initialize a book in Firestore
export const initializeBook = async (bookData: Omit<Book, 'id' | 'isAvailable'>) => {
    try {
        const docRef = doc(collection(db, 'books'));
        // Ensure all required fields are present
        await setDoc(docRef, {
            ...bookData,
            title: bookData.title || '',
            author: bookData.author || '',
            coverPageLink: bookData.coverPageLink || '',
            isAvailable: true,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error initializing book:', error);
        throw error;
    }
};

export const fetchUserBorrowedBooks = async (userId: string): Promise<BorrowedBook[]> => {
    try {
        // Get only active borrow transactions for the user
        const borrowsRef = collection(db, 'borrowTransactions');
        const q = query(
            borrowsRef,
            where('userId', '==', userId),
            where('status', '==', 'borrowed')
        );
        
        const snapshot = await getDocs(q);
        
        // Fetch the corresponding book details for each transaction
        const borrowedBooks = await Promise.all(
            snapshot.docs.map(async (transactionDoc) => {
                const transaction = transactionDoc.data();
                
                // Skip if missing required data
                if (!transaction.bookId || !transaction.borrowDate || !transaction.returnDate) {
                    console.error('Invalid transaction data:', transaction);
                    return null;
                }

                const bookRef = doc(db, 'books', transaction.bookId);
                const bookDoc = await getDoc(bookRef);
                
                if (!bookDoc.exists()) {
                    console.error(`Book ${transaction.bookId} not found`);
                    return null;
                }

                const bookData = bookDoc.data();

                // Convert Firestore timestamps to JavaScript Dates
                const borrowDate = transaction.borrowDate instanceof Timestamp 
                    ? transaction.borrowDate.toDate() 
                    : new Date(transaction.borrowDate);
                
                const returnDate = transaction.returnDate instanceof Timestamp 
                    ? transaction.returnDate.toDate() 
                    : new Date(transaction.returnDate);

                return {
                    id: bookDoc.id,
                    title: bookData.title || '',
                    author: bookData.author || '',
                    coverPageLink: bookData.coverPageLink || '',
                    isAvailable: false,
                    borrowDate,
                    dueDate: returnDate,
                    transactionId: transactionDoc.id
                } as BorrowedBook;
            })
        );

        // Filter out any null values and sort by due date
        const validBooks = borrowedBooks
            .filter((book): book is BorrowedBook => book !== null)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

        return validBooks;
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        return [];
    }
}; 