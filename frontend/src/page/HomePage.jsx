import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
        Welcome to the Library Management System
      </h1>
      <p className="text-lg md:text-xl mb-8 text-gray-300 text-center max-w-2xl">
        Easily browse, borrow, and return books with a seamless experience. Powered by modern web technologies for speed, reliability, and scalability.
      </p>
      <div className="flex gap-4">
        <Link
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          View Library
        </Link>
        <Link
          to="/about"
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          About Project
        </Link>
      </div>
    </div>
  );
};

export default Home;
