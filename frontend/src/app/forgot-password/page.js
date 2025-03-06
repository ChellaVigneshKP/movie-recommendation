"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Reset link sent to:", email);
    // Implement password reset logic here
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

      <div className="relative bg-black bg-opacity-80 p-10 rounded-lg text-white max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6">Forgot Password?</h2>
        <p className="text-gray-400 text-sm mb-4">
          Enter your email, and we'll send you a password reset link.
        </p>

        <form onSubmit={handleReset} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 rounded border border-gray-600 focus:outline-none"
            style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            suppressHydrationWarning
          />
          <button type="submit" className="bg-red-600 p-3 rounded font-semibold" suppressHydrationWarning>
            Send Reset Link
          </button>
        </form>

        {/* Back to Sign In */}
        <div className="text-center text-sm mt-6">
          Remember your password?{" "}
          <button
            className="text-white font-semibold hover:underline"
            onClick={() => router.push("/login")}
            suppressHydrationWarning
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
