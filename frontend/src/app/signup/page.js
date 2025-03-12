"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSelector } from "react-redux"; // Import Redux selector

const SignupPage = () => {
    const router = useRouter();
    const email = useSelector((state) => state.user.email); // Get email from Redux
    const [password, setPassword] = useState("");
    const [isTouched, setIsTouched] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!password) {
            return "Password is required.";
        } else if (!passwordRegex.test(password)) {
            return "Password must be at least 8 characters, include 1 lowercase, 1 uppercase, 1 number, and 1 special character.";
        }
        return "";
    };

    const handleSignup = (e) => {
        e.preventDefault();
        setIsTouched(true);
        const errorMessage = validatePassword(password);
        setPasswordError(errorMessage);
        if (errorMessage) return;
        router.push("/signup/verify-email");
    };

    return (
        <div className="relative w-full h-screen flex justify-center items-center bg-black">
            <div className="absolute inset-0 opacity-50">
                <Image
                    src="/login-banner.jpg"
                    fill
                    style={{ objectFit: "cover" }}
                    alt="Netflix Background"
                    priority
                />
            </div>
            <div className="absolute top-5 left-5">
                <Image
                    src="/logo.png"
                    alt="My Logo"
                    width={48}
                    height={48}
                    className="h-12 w-auto"
                />
            </div>
            <div className="absolute top-5 right-5 p-5">
                <button
                    className="bg-red-600 px-4 py-1 rounded-md text-white font-semibold hover:bg-red-700 transition"
                    onClick={() => router.push("/login")}
                    suppressHydrationWarning
                >
                    Sign In
                </button>
            </div>

            {/* Signup Box */}
            <div className="relative bg-black bg-opacity-80 p-10 rounded-lg text-white max-w-md w-full">
                <h2 className="text-lg font-semibold text-gray-400">STEP 1 OF 4</h2>
                <h1 className="text-3xl font-bold mb-2">Create a password to start your membership</h1>
                <p className="text-gray-400 text-sm mb-6">
                    Just a few more steps and you&apos;re done!<br /> We hate paperwork, too.
                </p>

                <form onSubmit={handleSignup} className="flex flex-col space-y-4">
                    <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email || ""}
                            disabled
                            className="w-full p-3 rounded border bg-gray-700 text-gray-300 cursor-not-allowed"
                            style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
                            suppressHydrationWarning
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Add a password"
                            className="w-full p-3 rounded border bg-gray-700 text-white focus:outline-none"
                            style={{ backgroundColor: "rgba(30, 30, 30, 0.5)" }}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError(validatePassword(e.target.value)); // Validate on change
                            }}
                            onBlur={() => setIsTouched(true)}
                            required
                            suppressHydrationWarning
                        />
                        {isTouched && passwordError && (
                            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-red-600 p-3 rounded font-semibold hover:bg-red-700 transition"
                        suppressHydrationWarning
                    >
                        Next
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
