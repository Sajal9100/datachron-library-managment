// const { PrismaClient } = require("../generated/prisma");
// const { ErrorApi } = require("../utils/errorApi");
// const { asyncHandler } = require("../utils/asyncHandler");

// const prisma = new PrismaClient();

// const addBook = asyncHandler(async (req, res) => {
//   const { title, author, isbn } = req.body;
//   const book = await prisma.book.create({ data: { title, author, isbn } });
//   res.status(201).json({ message: "Book added", book });
// });

// const getBooks = asyncHandler(async (req, res) => {
//   const books = await prisma.book.findMany({ where: { isAvailable: true } });
//   res.status(200).json({ message : "Books Fetched" ,data : books });
// });

// const borrowBook = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const book = await prisma.book.findUnique({ where: { id: Number(id) } });
//   if (!book) throw new ErrorApi("Book not found", 404);
//   if (!book.isAvailable) throw new ErrorApi("Book not available", 400);

//   const updated = await prisma.book.update({
//     where: { id: Number(id) },
//     data: { isAvailable: false },
//   });

//   res.json({ message: "Book borrowed", book: updated });
// });

// const returnBook = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const book = await prisma.book.findUnique({ where: { id: Number(id) } });
//   if (!book) throw new ErrorApi("Book not found", 404);

//   const updated = await prisma.book.update({
//     where: { id: Number(id) },
//     data: { isAvailable: true },
//   });

//   res.json({ message: "Book returned", book: updated });
// });


// // Search books by title or author with optional pagination
//  const searchBooks = async (req, res) => {
//   const { query, page = 1, limit = 10 } = req.query;
//   const skip = (page - 1) * limit;

//   const books = await prisma.book.findMany({
//     where: {
//       isAvailable: true,
//       OR: [
//         { title: { contains: query, mode: "insensitive" } },
//         { author: { contains: query, mode: "insensitive" } },
//       ],
//     },
//     skip: parseInt(skip),
//     take: parseInt(limit),
//   });

//   const total = await prisma.book.count({
//     where: {
//       isAvailable: true,
//       OR: [
//         { title: { contains: query, mode: "insensitive" } },
//         { author: { contains: query, mode: "insensitive" } },
//       ],
//     },
//   });

//   res.json({
//     page: parseInt(page),
//     limit: parseInt(limit),
//     total,
//     books,
//   });
// };


// // Get borrowing history for logged-in user
// //check not wokring i guess
//  const getUserHistory = async (req, res) => {
//   const userId = req.user.id;

//   const history = await prisma.borrow.findMany({
//     where: { userId },
//     include: {
//       book: true, // include book details
//     },
//     orderBy: { borrowedAt: "desc" },
//   });

//   const formattedHistory = history.map(record => ({
//     bookTitle: record.book.title,
//     bookAuthor: record.book.author,
//     borrowedAt: record.borrowedAt,
//     returnedAt: record.returnedAt,
//     isReturned: record.returnedAt ? true : false,
//   }));

//   res.json(formattedHistory);
// };



// module.exports = { addBook, getBooks, borrowBook, returnBook ,searchBooks, getUserHistory };









const { PrismaClient } = require("../generated/prisma");
const { ErrorApi } = require("../utils/errorApi");
const { asyncHandler } = require("../utils/asyncHandler");

const prisma = new PrismaClient();

/**
 * Add a new book
 */
const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn } = req.body;
  if (!title || !author || !isbn) {
    throw new ErrorApi("All fields are required", 400);
  }

  const book = await prisma.book.create({
    data: { title, author, isbn, isAvailable: true },
  });

  res.status(201).json({ message: "Book added", data: book });
});

/**
 * Get all books (available or borrowed)
 */
const getBooks = asyncHandler(async (req, res) => {
  const books = await prisma.book.findMany();
  res.status(200).json({ message: "Books fetched", data: books });
});

/**
 * Borrow a book
 */
const borrowBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({ where: { id: Number(id) } });

  if (!book) throw new ErrorApi("Book not found", 404);
  console.log(book.isAvailable)
  if (!book.isAvailable) throw new ErrorApi("Book is currently borrowed", 400);

  // Mark book as unavailable
  const updatedBook = await prisma.book.update({
    where: { id: Number(id) },
    data: { isAvailable: false },
  });

  // Record borrowing in Borrow table
  await prisma.borrow.create({
    data: {
      userId: req.user.id,
      bookId: book.id,
      borrowedAt: new Date(),
    },
  });

  res.status(200).json({ message: "Book borrowed", data: updatedBook });
});

/**
 * Return a book
 */
const returnBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({ where: { id: Number(id) } });

  if (!book) throw new ErrorApi("Book not found", 404);

  // Mark book as available
  const updatedBook = await prisma.book.update({
    where: { id: Number(id) },
    data: { isAvailable: true },
  });

  // Update the borrow record for this user & book
  await prisma.borrow.updateMany({
    where: { bookId: book.id, userId: req.user.id, returnedAt: null },
    data: { returnedAt: new Date() },
  });

  res.status(200).json({ message: "Book returned", data: updatedBook });
});

/**
 * Search books by title or author (with optional pagination)
 */
const searchBooks = asyncHandler(async (req, res) => {
  const { query = "", page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const whereFilter = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const books = await prisma.book.findMany({
    where: whereFilter,
    skip: parseInt(skip),
    take: parseInt(limit),
  });

  const total = await prisma.book.count({ where: whereFilter });

  res.status(200).json({
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    data: books,
  });
});

/**
 * Get borrowing history for the logged-in user
 */
const getUserHistory = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) throw new ErrorApi("Unauthorized", 401);

  const history = await prisma.borrow.findMany({
    where: { userId: req.user.id },
    include: { book: true },
    orderBy: { borrowedAt: "desc" },
  });

  const formattedHistory = history.map((record) => ({
    bookTitle: record.book?.title || "Unknown",
    bookAuthor: record.book?.author || "Unknown",
    borrowedAt: record.borrowedAt,
    returnedAt: record.returnedAt,
    isReturned: !!record.returnedAt,
  }));

  res.status(200).json({ data: formattedHistory });
});

/**
 * Get only available books (not borrowed)
 */
const getAvailableBooks = asyncHandler(async (req, res) => {
  const books = await prisma.book.findMany({
    where: { isAvailable: true }, // Only fetch available books
    orderBy: { title: "asc" }, // Optional: Sort alphabetically
  });

  if (!books || books.length === 0) {
    return res.status(200).json({ message: "No available books found", data: [] });
  }

  res.status(200).json({
    message: "Available books fetched successfully",
    data: books,
  });
});


module.exports = {
  addBook,
  getBooks,
  borrowBook,
  returnBook,
  searchBooks,
  getUserHistory,
  getAvailableBooks,

};
