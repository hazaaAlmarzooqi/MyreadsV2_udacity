import "./App.css";
import { useState, useEffect } from "react";
import * as BooksAPI from "./BooksAPI";

function App() {
  const defaultBooks = [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      shelf: "currentlyReading",
      coverUrl:
        "http://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73-GnPVEyb7MOCxDzOYF1PTQRuf6nCss9LMNOSWBpxBrz8Pm2_mFtWMMg_Y1dx92HT7cUoQBeSWjs3oEztBVhUeDFQX6-tWlWz1-feexS0mlJPjotcwFqAg6hBYDXuK_bkyHD-y&source=gbs_api",
    },
    {
      id: 2,
      title: "Ender's Game",
      author:"Orson Scott Card",
      shelf: "currentlyReading",
      coverUrl:
        "http://books.google.com/books/content?id=yDtCuFHXbAYC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72RRiTR6U5OUg3IY_LpHTL2NztVWAuZYNFE8dUuC0VlYabeyegLzpAnDPeWxE6RHi0C2ehrR9Gv20LH2dtjpbcUcs8YnH5VCCAH0Y2ICaKOTvrZTCObQbsfp4UbDqQyGISCZfGN&source=gbs_api",
    },
    {
      id: 3,
      title: "1776",
      author: "David McCullough",
      shelf: "wantToRead",
      coverUrl:
        "http://books.google.com/books/content?id=uu1mC6zWNTwC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73pGHfBNSsJG9Y8kRBpmLUft9O4BfItHioHolWNKOdLavw-SLcXADy3CPAfJ0_qMb18RmCa7Ds1cTdpM3dxAGJs8zfCfm8c6ggBIjzKT7XR5FIB53HHOhnsT7a0Cc-PpneWq9zX&source=gbs_api",
    },
    {
      id: 4,
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      shelf: "wantToRead",
      coverUrl:
        "http://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72G3gA5A-Ka8XjOZGDFLAoUeMQBqZ9y-LCspZ2dzJTugcOcJ4C7FP0tDA8s1h9f480ISXuvYhA_ZpdvRArUL-mZyD4WW7CHyEqHYq9D3kGnrZCNiqxSRhry8TiFDCMWP61ujflB&source=gbs_api",
    },
    {
      id: 5,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      shelf: "read",
      coverUrl:
        "http://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70Rw0CCwNZh0SsYpQTkMbvz23npqWeUoJvVbi_gXla2m2ie_ReMWPl0xoU8Quy9fk0Zhb3szmwe8cTe4k7DAbfQ45FEzr9T7Lk0XhVpEPBvwUAztOBJ6Y0QPZylo4VbB7K5iRSk&source=gbs_api",
    },
  ];

  const [showSearchPage, setShowSearchPage] = useState(false);
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem("books");
    return savedBooks ? JSON.parse(savedBooks) : defaultBooks;
  });
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  const handleShelfChange = (book, newShelf) => {
    // Check if the book is already in the main list
    let updatedBooks = books.map((b) =>
      b.id === book.id ? { ...b, shelf: newShelf } : b
    );
  
    if (!books.find((b) => b.id === book.id)) {
      // Include all relevant details, including authors and coverUrl, when adding from search
      const newBook = {
        id: book.id,
        title: book.title,
        authors: book.authors || ["Unknown Author"], // Set to "Unknown Author" if undefined
        coverUrl: book.imageLinks ? book.imageLinks.thumbnail : "", // Set cover URL if available
        shelf: newShelf,
      };
      updatedBooks = [...updatedBooks, newBook];
    }
  
    setBooks(updatedBooks);
    BooksAPI.update(book, newShelf);
  };
  

  const handleSearch = (query) => {
    setQuery(query);
    if (query) {
      BooksAPI.search(query, 20).then((results) => {
        if (results && !results.error) {
          const lowerQuery = query.toLowerCase().trim();
  
          // Filter results by title, author, or ISBN
          const filteredResults = results.filter((result) => {
            // Check if the title contains the query
            const titleMatch = result.title?.toLowerCase().includes(lowerQuery);
  
            // Check if any author contains the query
            const authorMatch = result.authors?.some((author) =>
              author.toLowerCase().includes(lowerQuery)
            );
  
            // Return true if any of the conditions match
            return titleMatch || authorMatch;
          });
  
          // Map the results to include the shelf and cover URL
          const mappedResults = filteredResults.map((result) => {
            const matchedBook = books.find((b) => b.id === result.id);
            return {
              ...result,
              shelf: matchedBook ? matchedBook.shelf : "none",
              coverUrl: result.imageLinks ? result.imageLinks.thumbnail : "",
            };
          });
  
          setSearchResults(mappedResults);
        } else {
          setSearchResults([]);
        }
      });
    } else {
      setSearchResults([]);
    }
  };
  
  


  const renderShelf = (shelfName, shelfTitle) => (
    <div className="bookshelf">
      <h2 className="bookshelf-title">{shelfTitle}</h2>
      <div className="bookshelf-books">
        <ol className="books-grid">
          {books
            .filter((book) => book.shelf === shelfName)
            .map((book) => (
              <li key={book.id}>
                <div className="book">
                  <div className="book-top">
                    <div
                      className="book-cover"
                      style={{
                        width: 128,
                        height: 193,
                        backgroundImage: `url(${book.coverUrl})`,
                      }}
                    ></div>
                    <div className="book-shelf-changer">
                      <select
                        value={book.shelf}
                        onChange={(e) => handleShelfChange(book, e.target.value)}
                      >
                        <option value="none" disabled>
                          Move to...
                        </option>
                        <option value="currentlyReading">Currently Reading</option>
                        <option value="wantToRead">Want to Read</option>
                        <option value="read">Read</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                  <div className="book-title">{book.title}</div>
                  <div className="book-authors">
                  {book.authors ? book.authors.join(", ") : book.author}
                  </div>                
                </div>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );

  return (
    <div className="app">
      {showSearchPage ? (
        <div className="search-books">
          <div className="search-books-bar">
            <a className="close-search" onClick={() => setShowSearchPage(false)}>
              Close
            </a>
            <div className="search-books-input-wrapper">
              <input
                type="text"
                placeholder="Search by title, author, or ISBN"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="search-books-results">
            <ol className="books-grid">
              {searchResults.map((book) => (
                <li key={book.id}>
                  <div className="book">
                    <div className="book-top">
                      <div
                        className="book-cover"
                        style={{
                          width: 128,
                          height: 193,
                          backgroundImage: `url(${book.coverUrl})`,
                        }}
                      ></div>
                      <div className="book-shelf-changer">
                        <select
                          value={book.shelf}
                          onChange={(e) => handleShelfChange(book, e.target.value)}
                        >
                          <option value="none" disabled>
                            Move to...
                          </option>
                          <option value="currentlyReading">Currently Reading</option>
                          <option value="wantToRead">Want to Read</option>
                          <option value="read">Read</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                    <div className="book-title">{book.title}</div>
                    <div className="book-authors">{book.authors?.join(", ")}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="list-books">
          <div className="list-books-title">
            <h1>MyReads</h1>
          </div>
          <div className="list-books-content">
            {renderShelf("currentlyReading", "Currently Reading")}
            {renderShelf("wantToRead", "Want to Read")}
            {renderShelf("read", "Read")}
          </div>
          <div className="open-search">
            <a onClick={() => setShowSearchPage(true)}>Add a book</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
