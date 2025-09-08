import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axios";
import useAuthStore from "../../store/useAuthStore";

const Dashboard = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient(); //from main.jsx 
  const [activeTab, setActiveTab] = useState("books"); // books | history
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Fetch books with search & pagination
  const {
    data: booksData,
    isLoading: loadingBooks,
  } = useQuery({
    queryKey: ["books", searchQuery, page],
    queryFn: async () => {
      const res = await axiosInstance.get("/books/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchQuery, page, limit: 10 },
      });
      return res.data;
    },
    enabled: !!token,
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
    enabled: !!token,
  });

  // Borrow book
  const borrowBook = async (id) => {
    console.log(id);
    await axiosInstance.put(`/books/borrow/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    queryClient.invalidateQueries(["books"]);
    queryClient.invalidateQueries(["history"]);
  };

  // Return book
  const returnBook = async (id) => {
    await axiosInstance.put(`/books/return/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    queryClient.invalidateQueries(["books"]);
    queryClient.invalidateQueries(["history"]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Library Dashboard</h1>

      <div className="flex gap-6">
        {/* Left vertical tabs */}
        <div className="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("books")}
            className={`px-4 py-2 rounded-lg text-left font-medium transition ${
              activeTab === "books"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-left font-medium transition ${
              activeTab === "history"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            History
          </button>
        </div>

        {/* Right side content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-x-auto">
          {/* Books Tab */}
          {activeTab === "books" && (
            <>
              {/* Search */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 px-3 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {loadingBooks ? (
                <p className="text-gray-600 dark:text-gray-300">Loading books...</p>
              ) : booksData?.data?.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No books found.</p>
              ) : (
                <>
                  <table className="min-w-full rounded-lg">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Author</th>
                        <th className="px-4 py-2 text-left">ISBN</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booksData.data.map((book) => (
                        <tr key={book.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-4 py-2">{book.title}</td>
                          <td className="px-4 py-2">{book.author}</td>
                          <td className="px-4 py-2">{book.isbn}</td>
                          <td className="px-4 py-2">{book.isAvailable ? "Available" : "Borrowed"}</td>
                          <td className="px-4 py-2">
                            {book.isAvailable ? (
                              <button
                                onClick={() => borrowBook(book.id)}
                                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                              >
                                Borrow
                              </button>
                            ) : (
                              <button
                                onClick={() => returnBook(book.id)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                Return
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="mt-4 flex justify-between">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                      Prev
                    </button>
                    <span className="px-4 py-2">
                      Page {page} / {Math.ceil((booksData?.total || 1) / booksData?.limit || 1)}
                    </span>
                    <button
                      disabled={page >= Math.ceil((booksData?.total || 1) / booksData?.limit)}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <>
              {loadingHistory ? (
                <p className="text-gray-600 dark:text-gray-300">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No history found.</p>
              ) : (
                <table className="min-w-full rounded-lg">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
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
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-2">{record.bookTitle}</td>
                        <td className="px-4 py-2">{record.bookAuthor}</td>
                        <td className="px-4 py-2">{new Date(record.borrowedAt).toLocaleString()}</td>
                        <td className="px-4 py-2">{record.returnedAt ? new Date(record.returnedAt).toLocaleString() : "-"}</td>
                        <td className="px-4 py-2">{record.isReturned ? "Returned" : "Borrowed"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
