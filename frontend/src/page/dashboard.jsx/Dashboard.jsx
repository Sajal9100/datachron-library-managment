import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axios";
import useAuthStore from "../../store/useAuthStore";

const Dashboard = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user); // ensure this gives { id, name, ... }
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [page, setPage] = useState(1);

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
              <table className="min-w-full rounded-lg">
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
    </div>
  );
};

export default Dashboard;






// import { useState } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import axiosInstance from "../../api/axios";
// import useAuthStore from "../../store/useAuthStore";

// const Dashboard = () => {
//   const token = useAuthStore((state) => state.token);
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState("books"); // books | history | search
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchPage, setSearchPage] = useState(1);
//   const [page, setPage] = useState(1);

//   // Fetch books (Books Tab)
//   const { data: booksData, isLoading: loadingBooks } = useQuery({
//     queryKey: ["books", page],
//     queryFn: async () => {
//       const res = await axiosInstance.get("/books", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { page, limit: 10 },
//       });
//       return res.data;
//     },
//     enabled: activeTab === "books" && !!token,
//     keepPreviousData: true,
//   });

//   // Fetch user borrow history
//   const { data: history = [], isLoading: loadingHistory } = useQuery({
//     queryKey: ["history"],
//     queryFn: async () => {
//       const res = await axiosInstance.get("/books/history", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return res.data.data;
//     },
//     enabled: activeTab === "history" && !!token,
//   });

//   // Fetch search results (now defaults to show all available)
//   const { data: searchResults, isLoading: loadingSearch } = useQuery({
//     queryKey: ["search", searchQuery, searchPage],
//     queryFn: async () => {
//       const res = await axiosInstance.get("/books/search", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { query: searchQuery || "", page: searchPage, limit: 10 },
//       });
//       return res.data;
//     },
//     enabled: activeTab === "search" && !!token, // always fetch in search tab
//     keepPreviousData: true,
//   });

//   // Borrow book
//   const borrowBook = async (id) => {
//     await axiosInstance.put(
//       `/books/borrow/${id}`,
//       {},
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     queryClient.invalidateQueries(["books"]);
//     queryClient.invalidateQueries(["history"]);
//     queryClient.invalidateQueries(["search"]);
//   };

//   // Return book
//   const returnBook = async (id) => {
//     await axiosInstance.put(
//       `/books/return/${id}`,
//       {},
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     queryClient.invalidateQueries(["books"]);
//     queryClient.invalidateQueries(["history"]);
//     queryClient.invalidateQueries(["search"]);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
//       <h1 className="text-3xl font-bold mb-8">Library Dashboard</h1>

//       <div className="flex gap-6">
//         {/* Left vertical tabs */}
//         <div className="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col gap-2">
//           {["books", "history", "search"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-lg text-left font-medium transition ${
//                 activeTab === tab
//                   ? "bg-indigo-600 text-white"
//                   : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Right side content */}
//         <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-x-auto">
//           {/* Books Tab */}
//           {activeTab === "books" &&
//             (loadingBooks ? (
//               <p>Loading books...</p>
//             ) : (
//               <table className="min-w-full rounded-lg">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-2 text-left">Title</th>
//                     <th className="px-4 py-2 text-left">Author</th>
//                     <th className="px-4 py-2 text-left">ISBN</th>
//                     <th className="px-4 py-2 text-left">Status</th>
//                     <th className="px-4 py-2 text-left">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {booksData?.data?.map((book) => (
//                     <tr key={book.id}>
//                       <td className="px-4 py-2">{book.title}</td>
//                       <td className="px-4 py-2">{book.author}</td>
//                       <td className="px-4 py-2">{book.isbn}</td>
//                       <td className="px-4 py-2">
//                         {book.isAvailable ? "Available" : "Borrowed"}
//                       </td>
//                       <td className="px-4 py-2">
//                         {book.isAvailable ? (
//                           <button
//                             onClick={() => borrowBook(book.id)}
//                             className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//                           >
//                             Borrow
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => returnBook(book.id)}
//                             className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//                           >
//                             Return
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ))}

//           {/* History Tab */}
//           {activeTab === "history" &&
//             (loadingHistory ? (
//               <p>Loading history...</p>
//             ) : (
//               <table className="min-w-full rounded-lg">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-2 text-left">Title</th>
//                     <th className="px-4 py-2 text-left">Author</th>
//                     <th className="px-4 py-2 text-left">Borrowed At</th>
//                     <th className="px-4 py-2 text-left">Returned At</th>
//                     <th className="px-4 py-2 text-left">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {history.map((record, idx) => (
//                     <tr key={idx}>
//                       <td className="px-4 py-2">{record.bookTitle}</td>
//                       <td className="px-4 py-2">{record.bookAuthor}</td>
//                       <td className="px-4 py-2">
//                         {new Date(record.borrowedAt).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-2">
//                         {record.returnedAt
//                           ? new Date(record.returnedAt).toLocaleString()
//                           : "Not Returned Yet"}
//                       </td>
//                       <td className="px-4 py-2">
//                         {record.isReturned ? "Returned" : "Borrowed"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ))}

//           {/* Search Tab */}
//           {activeTab === "search" && (
//             <>
//               <div className="mb-4 flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Search available books..."
//                   value={searchQuery}
//                   onChange={(e) => {
//                     setSearchQuery(e.target.value);
//                     setSearchPage(1);
//                   }}
//                   className="flex-1 px-3 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400"
//                 />
//               </div>

//               {loadingSearch ? (
//                 <p>Loading search results...</p>
//               ) : searchResults?.data?.length === 0 ? (
//                 <p>No available books found.</p>
//               ) : (
//                 <table className="min-w-full rounded-lg">
//                   <thead>
//                     <tr>
//                       <th className="px-4 py-2 text-left">Title</th>
//                       <th className="px-4 py-2 text-left">Author</th>
//                       <th className="px-4 py-2 text-left">ISBN</th>
//                       <th className="px-4 py-2 text-left">status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {searchResults?.data.map((book) => (
//                       <tr key={book.id}>
//                         <td className="px-4 py-2">{book.title}</td>
//                         <td className="px-4 py-2">{book.author}</td>
//                         <td className="px-4 py-2">{book.isbn}</td>
//                         <td className="px-4 py-2">
//                           {book.isAvailable ? "Available" : "Not Available"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
