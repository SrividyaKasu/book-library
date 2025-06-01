import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
 interface Book {
    title: string;
    author: string;
    coverPageLink: string;
}

export const bookConverter: FirestoreDataConverter<Book> = {
    toFirestore(book: Book) {
        return {
            title: book.title,
            author: book.author,
            coverPageLink: book.coverPageLink ?? '',
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Book {
        const data = snapshot.data(options);
        return {
            title: data.title,
            author: data.author,
            coverPageLink: data.coverPageLink ?? '',
        };
    },
};
