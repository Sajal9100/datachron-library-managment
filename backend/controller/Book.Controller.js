const { PrismaClient } = require("../generated/prisma");
const { ErrorApi } = require("../utils/errorApi");
const { asyncHandler } = require("../utils/asyncHandler");

const prisma = new PrismaClient();

const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn } = req.body;
  const book = await prisma.book.create({ data: { title, author, isbn } });
  res.status(201).json({ message: "Book added", book });
});

const getBooks = asyncHandler(async (req, res) => {
  const books = await prisma.book.findMany({ where: { isAvailable: true } });
  res.json({ books });
});

const borrowBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({ where: { id: Number(id) } });
  if (!book) throw new ErrorApi("Book not found", 404);
  if (!book.isAvailable) throw new ErrorApi("Book not available", 400);

  const updated = await prisma.book.update({
    where: { id: Number(id) },
    data: { isAvailable: false },
  });

  res.json({ message: "Book borrowed", book: updated });
});

const returnBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({ where: { id: Number(id) } });
  if (!book) throw new ErrorApi("Book not found", 404);

  const updated = await prisma.book.update({
    where: { id: Number(id) },
    data: { isAvailable: true },
  });

  res.json({ message: "Book returned", book: updated });
});


// Search books by title or author with optional pagination
 const searchBooks = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const books = await prisma.book.findMany({
    where: {
      isAvailable: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
      ],
    },
    skip: parseInt(skip),
    take: parseInt(limit),
  });

  const total = await prisma.book.count({
    where: {
      isAvailable: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
      ],
    },
  });

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    books,
  });
};


// Get borrowing history for logged-in user
//check not wokring i guess
 const getUserHistory = async (req, res) => {
  const userId = req.user.id;

  const history = await prisma.borrow.findMany({
    where: { userId },
    include: {
      book: true, // include book details
    },
    orderBy: { borrowedAt: "desc" },
  });

  const formattedHistory = history.map(record => ({
    bookTitle: record.book.title,
    bookAuthor: record.book.author,
    borrowedAt: record.borrowedAt,
    returnedAt: record.returnedAt,
    isReturned: record.returnedAt ? true : false,
  }));

  res.json(formattedHistory);
};



module.exports = { addBook, getBooks, borrowBook, returnBook ,searchBooks, getUserHistory };
