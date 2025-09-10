import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axios";
import useAuthStore from "../../store/useAuthStore";
import Modal from "../../components/Modal";
import { useEffect } from "react";

const Dashboard = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user); // ensure this gives { id, name, ... }
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [page, setPage] = useState(1);
  // added
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
  title: "",
  author: "",
  isbn: "",
});

//   useEffect(() => {
//   setIsModalOpen(true);
// },[]);

//add Book
const handleAddBook = async (e) => {
  e.preventDefault();
  try {
    await axiosInstance.post(
      "/books",
      newBook,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    queryClient.invalidateQueries(["books"]); // refresh book list
    setIsModalOpen(false); // close modal
    setNewBook({ title: "", author: "", isbn: "" }); // reset form
    setIsModalOpen(false);
  } catch (err) {
    console.error("Error adding book:", err);
  }
};


  // Fetch books
  const { data: booksData, isLoading: loadingBooks } = useQuery({
    queryKey: ["books", page],
    queryFn: async () => {
      const res = await axiosInstance.get("/books", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10 },
      });
      return res.data;
    },
    enabled: activeTab === "books" && !!token,
    keepPreviousData: true,
  });

  // Fetch user borrow history
  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const res = await axiosInstance.get("/books/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    enabled: activeTab === "history" && !!token,
  });

  // Search
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ["search", searchQuery, searchPage],
    queryFn: async () => {
      const res = await axiosInstance.get("/books/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchQuery || "", page: searchPage, limit: 10 },
      });
      return res.data;
    },
    enabled: activeTab === "search" && !!token,
    keepPreviousData: true,
  });

  // Borrow
  const borrowBook = async (id) => {
    await axiosInstance.put(
      `/books/borrow/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    queryClient.invalidateQueries(["books"]);
    queryClient.invalidateQueries(["history"]);
    queryClient.invalidateQueries(["search"]);
  };

  // Return
  const returnBook = async (id) => {
    await axiosInstance.put(
      `/books/return/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    queryClient.invalidateQueries(["books"]);
    queryClient.invalidateQueries(["history"]);
    queryClient.invalidateQueries(["search"]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Library Dashboard</h1>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col gap-2">
          {["books", "history", "search"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-left font-medium transition ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}


     



        </div>


  

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-x-auto">
          {/* Books */}
          {activeTab === "books" &&
            (loadingBooks ? (
              <p>Loading books...</p>
            ) : (
              <>
                <div className="flex justify-end mb-3">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={ () => setIsModalOpen(true)}>
                    Add New Book
                  </button>
                </div>

                <table className="min-w-full rounded-lg ">
                  <thead>
                  
                    <tr>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Author</th>
                      <th className="px-4 py-2 text-left">ISBN</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booksData?.data?.map((book) => (
                      <tr key={book.id}>
                        <td className="px-4 py-2">{book.title}</td>
                        <td className="px-4 py-2">{book.author}</td>
                        <td className="px-4 py-2">{book.isbn}</td>
                        <td className="px-4 py-2">
                          {book.isAvailable ? "Available" : "Borrowed"}
                        </td>
                        <td className="px-4 py-2">
                          {book.isAvailable ? (
                            <button
                              onClick={() => borrowBook(book.id)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              Borrow
                            </button>
                          ) : book.borrowedBy === user?.id ? (
                            <button
                              onClick={() => returnBook(book.id)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Return
                            </button>
                          ) : (
                            <span className="text-gray-500">Not Available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ))}



          {/* History
          {activeTab === "history" &&
            (loadingHistory ? (
              <p>Loading history...</p>
            ) : (
              <table className="min-w-full rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Author</th>
                    <th className="px-4 py-2 text-left">Borrowed At</th>
                    <th className="px-4 py-2 text-left">Returned At</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{record.bookTitle}</td>
                      <td className="px-4 py-2">{record.bookAuthor}</td>
                      <td className="px-4 py-2">
                        {new Date(record.borrowedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {record.returnedAt
                          ? new Date(record.returnedAt).toLocaleString()
                          : "Not Returned Yet"}
                      </td>
                      <td className="px-4 py-2">
                        {record.isReturned ? "Returned" : "Borrowed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))} */}

          {/* History */}
          {activeTab === "history" &&
            (loadingHistory ? (
              <p>Loading history...</p>
            ) : (
              <table className="min-w-full rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Author</th>
                    <th className="px-4 py-2 text-left">Borrowed At</th>
                    <th className="px-4 py-2 text-left">Returned At</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{record.bookTitle}</td>
                      <td className="px-4 py-2">{record.bookAuthor}</td>
                      <td className="px-4 py-2">
                        {new Date(record.borrowedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {record.returnedAt
                          ? new Date(record.returnedAt).toLocaleString()
                          : "Not Returned Yet"}
                      </td>
                      <td className="px-4 py-2">
                        {record.isReturned ? "Returned" : "Borrowed"}
                      </td>
                      <td className="px-4 py-2">
                        {!record.isReturned ? (
                          <button
                            onClick={() => returnBook(record.bookId)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Return
                          </button>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}






          {/* Search */}
          {activeTab === "search" && (
            <>
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchPage(1);
                  }}
                  className="flex-1 px-3 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {loadingSearch ? (
                <p>Loading search results...</p>
              ) : searchResults?.data?.length === 0 ? (
                <p>No books found.</p>
              ) : (
                <table className="min-w-full rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Author</th>
                      <th className="px-4 py-2 text-left">ISBN</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults?.data.map((book) => (
                      <tr key={book.id}>
                        <td className="px-4 py-2">{book.title}</td>
                        <td className="px-4 py-2">{book.author}</td>
                        <td className="px-4 py-2">{book.isbn}</td>
                        <td className="px-4 py-2">
                          {book.isAvailable ? "Available" : "Not Available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

       
            
<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Add New Book</h2>

        {/* Form inside modal */}
        <form className="space-y-3" onSubmit={handleAddBook}>
        <input
  type="text"
  placeholder="Title"
  value={newBook.title}
  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
  className="w-full border px-3 py-2 rounded"
/>
<input
  type="text"
  placeholder="Author"
  value={newBook.author}
  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
  className="w-full border px-3 py-2 rounded"
/>
<input
className="w-full border px-3 py-2 rounded"
  type="text"
  placeholder="ISBN"
  value={newBook.isbn}
  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
/>


          <button
            type="submit"
            
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Save Book
          </button>
        </form>
      </Modal>

      
    </div>
    
  );
};

export default Dashboard;
