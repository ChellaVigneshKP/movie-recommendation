"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaGlobe } from "react-icons/fa";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setEmail as setReduxEmail } from "@/store/userSlice";

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValid(validateEmail(newEmail));
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleGetStarted = () => {
    if (!isValid) {
      setIsTouched(true);
      return;
    }

    dispatch(setReduxEmail(email));
    router.push("/signup");
  };

  const getBorderColor = () => {
    if (isTouched && !isValid) return "border-red-500";
    if (isValid) return "border-green-500";
    return "border-gray-700";
  };

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
          <button
            className="bg-red-600 px-4 py-1 rounded-md text-white font-semibold"
            onClick={() => router.push("/login")} suppressHydrationWarning
          >
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
        <div className="mt-6 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-3 w-full max-w-lg">
          <div className="w-full md:w-2/3">
            <input
              type="email"
              placeholder="Email address"
              className={`w-full p-4 rounded-md text-white placeholder-gray-300 outline-none border ${getBorderColor()}`}
              style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              suppressHydrationWarning
            />
            <p className="text-red-500 text-sm mt-1 h-5">
              {isTouched && !isValid ? "Please enter a valid email address." : ""}
            </p>
          </div>
          <button
            className="bg-red-600 text-white px-6 py-4 rounded-md font-semibold hover:bg-red-700 transition"
            onClick={handleGetStarted}
            suppressHydrationWarning
          >
            Get Started →
          </button>
        </div>
      </div>
      <footer className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-sm text-center w-full">
        Made with ❤️ by <br />Chella Vignesh K P [M24DE3025] & Dinesh Periyasamy [M24DE3026]
      </footer>

    </div>
  );
};

export default Home;