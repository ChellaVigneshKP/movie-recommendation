"use client";

import Image from 'next/image';
import { FaGlobe } from "react-icons/fa";

const Banner = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center bg-black">
      <div className="absolute inset-0 opacity-50">
        <Image
          src="/login-banner.jpg"
          fill
          style={{ objectFit: "cover" }}
          alt="Netflix Background"
          priority
        />
      </div>
      <div className="absolute top-5 right-5 p-5">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 border border-gray-500 px-3 py-1 rounded-md bg-black bg-opacity-50 text-white cursor-pointer">
            <FaGlobe />
            <span>English</span>
          </div>
          <button className="bg-red-600 px-4 py-1 rounded-md text-white font-semibold">
            Sign In
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-white text-5xl md:text-6xl font-bold drop-shadow-md max-w-3xl">
          Unlimited movies, TV shows, and more
        </h1>
        <p className="text-white text-lg mt-4 drop-shadow-md">
          A Movie Recommendation System for Machine Learning With Big Data Project
        </p>
        <div className="mt-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-3 w-full max-w-lg">
          <input
            type="text"
            placeholder="Email address"
            className="w-full md:w-2/3 p-4 rounded-md text-white placeholder-gray-300 outline-none border border-gray-700"
            style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
          />
          <button className="bg-red-600 text-white px-6 py-4 rounded-md font-semibold hover:bg-red-700 transition">
            Get Started →
          </button>
        </div>
      </div>
      <footer className="absolute bottom-5 text-white text-sm">
        Made with ❤️ by Chella Vignesh K P [M24DE3025] & Dinesh Periyasamy [M24DE3026]
      </footer>
    </div>
  );
};

export default Banner;
