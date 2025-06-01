import requests
import json

def get_book_info(book_input_name):
    """Fetch book title, authors, and cover image from Google Books API."""
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        'q': book_input_name,
        'maxResults': 1
    }

    response = requests.get(url, params=params)
    data = response.json()

    if 'items' not in data:
        print(f"No results found for: {book_input_name}")
        return {
            'name': book_input_name,
            'title': 'Not Found',
            'author': 'Not Found',
            'coverPageLink': 'Not Found'
        }

    book = data['items'][0]['volumeInfo']
    actual_title = book.get('title', 'Unknown Title')
    authors = ', '.join(book.get('authors', ['Unknown Author']))
    image_url = book.get('imageLinks', {}).get('thumbnail', 'No image available')

    return {
        'name': book_input_name,
        'title': actual_title,
        'author': authors,
        'coverPageLink': image_url
    }

def main(input_file='books.txt', output_file='books.json'):
    with open(input_file, 'r', encoding='utf-8') as f:
        book_titles = [line.strip() for line in f if line.strip()]

    results = []
    for title in book_titles:
        print(f"Fetching: {title}")
        info = get_book_info(title)
        results.append(info)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print(f"\nSaved to {output_file}")

if __name__ == "__main__":
    main()
