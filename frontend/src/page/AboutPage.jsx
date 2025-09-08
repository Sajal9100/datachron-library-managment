import React from "react";
import { FaReact, FaNodeJs, FaDatabase } from "react-icons/fa";
import { SiPrisma, SiExpress, SiAxios, SiReactquery } from "react-icons/si"; // valid icons

const techStack = [
  { name: "React", desc: "Frontend Framework", icon: <FaReact className="text-blue-500" /> },
  { name: "TanStack Query", desc: "Server State Management", icon: <SiReactquery className="text-purple-500" /> },
  { name: "Axios", desc: "HTTP Client", icon: <SiAxios className="text-indigo-500" /> },
  { name: "Express.js", desc: "Backend Framework", icon: <SiExpress className="text-gray-700" /> },
  { name: "Node.js", desc: "Runtime Environment", icon: <FaNodeJs className="text-green-600" /> },
  { name: "Prisma", desc: "ORM for Database", icon: <SiPrisma className="text-teal-500" /> },
  { name: "PostgreSQL", desc: "Database", icon: <FaDatabase className="text-blue-700" /> },
];

const features = [
  "Browse, borrow, and return books seamlessly",
  "JWT-based authentication and secure routes",
  "Responsive design for desktop and mobile",
  "Integration between frontend and backend",
  "Real-time updates for book availability",
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-indigo-600 dark:text-indigo-400">
          About LibraryX
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          LibraryX is a modern Library Management System designed to provide a smooth and user-friendly experience.
          It allows users to browse, borrow, and return books efficiently while ensuring secure authentication and backend integration.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="max-w-5xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center text-center hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">{tech.icon}</div>
              <h3 className="text-xl font-semibold mb-1">{tech.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Features</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="bg-indigo-50 dark:bg-indigo-900 border-l-4 border-indigo-600 dark:border-indigo-400 p-4 rounded shadow hover:shadow-lg transition"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Call to Action */}
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
          Experience the seamless library management experience with LibraryX. Explore the dashboard, borrow books, and manage your library effortlessly.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
};

export default About;
