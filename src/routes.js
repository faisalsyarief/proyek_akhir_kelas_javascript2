const { nanoid } = require('nanoid');
const books = [];

const routes = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Homepage';
        },
    },
    {
        method: 'POST',
        path: '/books',
        handler: (request, h) => {
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            if (!name || name.trim() === '') {
                const response = h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. Mohon isi nama buku',
                });
                response.code(400);
                return response;
            }
            if (readPage > pageCount) {
                const response = h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
                });
                response.code(400);
                return response;
            }

            const id = nanoid(16);
            const insertedAt = new Date().toISOString();
            const updatedAt = insertedAt;
            const finished = pageCount === readPage;

            const newBook = {
                id,
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                finished,
                reading,
                insertedAt,
                updatedAt
            };
            books.push(newBook);

            const isSuccess = books.filter((book) => book.id === id).length > 0;
            if (isSuccess) {
                const response = h.response({
                    status: 'success',
                    message: 'Buku berhasil ditambahkan',
                    data: {
                        bookId: id,
                    },
                });
                response.code(201);
                return response;
            }

            const response = h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku',
            });
            response.code(500);
            return response;
        }
    },
    {
        method: 'GET',
        path: '/books',
        handler: (request, h) => {
            const { name, reading, finished } = request.query;
            let filteredBooks = [...books];

            if (name) {
                filteredBooks = filteredBooks.filter(book =>
                    book.name.toLowerCase().includes(name.toLowerCase())
                );
            }

            if (reading) {
                const readingStatus = reading === '1';
                filteredBooks = filteredBooks.filter(book => book.reading === readingStatus);
            }

            if (finished) {
                const finishedStatus = finished === '1';
                filteredBooks = filteredBooks.filter(book => book.finished === finishedStatus);
            }

            return h.response({
                status: 'success',
                data: {
                    books: filteredBooks.map(book => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                }
            });
        },
    },
    {
        method: 'GET',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const { bookId } = request.params;
            const book = books.find(b => b.id === bookId);

            if (book) {
                return h.response({
                    status: 'success',
                    data: {
                        book
                    }
                }).code(200);
            } else {
                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan'
                }).code(404);
            }
        },
    },
    {
        method: 'PUT',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const { bookId } = request.params;
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            if (!name || name.trim() === '') {
                const response = h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Mohon isi nama buku',
                });
                response.code(400);
                return response;
            }
            if (readPage > pageCount) {
                const response = h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
                });
                response.code(400);
                return response;
            }

            const bookIndex = books.findIndex(b => b.id === bookId);
            if (bookIndex !== -1) {
                const updatedBook = {
                    ...books[bookIndex],
                    name,
                    year,
                    author,
                    summary,
                    publisher,
                    pageCount,
                    readPage,
                    reading,
                    finished: pageCount === readPage,
                    updatedAt: new Date().toISOString()
                };

                books[bookIndex] = updatedBook;

                return h.response({
                    status: 'success',
                    message: 'Buku berhasil diperbarui',
                    data: {
                        book: updatedBook
                    }
                }).code(200);
            } else {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Id tidak ditemukan',
                }).code(404);
            }
        }
    },
    {
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const { bookId } = request.params;
            const bookIndex = books.findIndex(b => b.id === bookId);

            if (bookIndex !== -1) {
                books.splice(bookIndex, 1);
                return h.response({
                    status: 'success',
                    message: 'Buku berhasil dihapus'
                }).code(200);
            } else {
                return h.response({
                    status: 'fail',
                    message: 'Buku gagal dihapus. Id tidak ditemukan'
                }).code(404);
            }
        }
    },
];

module.exports = routes;