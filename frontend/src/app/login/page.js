"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    // Implement login logic here
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-50">
        <Image
          src="/login-banner.jpg"
          fill
          style={{ objectFit: "cover" }}
          alt="Netflix Background"
          priority
        />
      </div>

      {/* Login Box */}
      <div className="relative bg-black bg-opacity-80 p-10 rounded-lg text-white max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6">Sign In</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email or mobile number"
            className="p-3 rounded border border-gray-600 focus:outline-none"
            style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            suppressHydrationWarning
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded border border-gray-600 focus:outline-none"
            value={password}
            style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            suppressHydrationWarning
          />
          <button type="submit" className="bg-red-600 p-3 rounded font-semibold" suppressHydrationWarning>
            Sign In
          </button>
        </form>

        {/* Extra Options */}
        <div className="flex justify-between text-sm mt-4 text-gray-400">
          <label>
            <input type="checkbox" className="mr-2" /> Remember me
          </label>
          <button
            type="button"
            className="hover:underline"
            onClick={() => router.push("/forgot-password")}
            suppressHydrationWarning
          >
            Forgot password?
          </button>

        </div>

        {/* Sign-up Link */}
        <div className="text-center text-sm mt-6">
          New to Netflix?{" "}
          <button
            type="button"
            className="text-white font-semibold hover:underline"
            onClick={() => router.push("/")}
            suppressHydrationWarning
          >
            Sign up now.
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;