const  express = require("express") ;
const {
  addBook,
  getBooks,
  borrowBook,
  returnBook,
  searchBooks,
  getUserHistory,

} =  require ("../controller/Book.Controller.js");
const { protectedRoute, admin } = require ("../middleware/auth.Middleware.js");

const router = express.Router();

router.get("/", protectedRoute, getBooks); // Only logged-in users
router.post("/", protectedRoute, admin, addBook); // Admin only
router.put("/borrow/:id", protectedRoute, borrowBook);
router.put("/return/:id", protectedRoute, returnBook);
router.get("/search", searchBooks);
router.get("/history", protectedRoute, getUserHistory);

module.exports =  router;
