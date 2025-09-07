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

module.exports = { addBook, getBooks, borrowBook, returnBook };
