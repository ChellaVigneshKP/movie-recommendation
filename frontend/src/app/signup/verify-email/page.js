"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux"; // Get email from Redux
import { ShieldCheck } from "lucide-react";
const VerifyEmail = () => {
    const router = useRouter();
    const email = useSelector((state) => state.user.email); // Get user email from Redux

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
                    onClick={() => router.push("/signout")}
                    suppressHydrationWarning
                >
                    Sign Out
                </button>
            </div>
            {/* Verify Email Box */}
            <div className="relative bg-black bg-opacity-80 p-10 rounded-lg text-white max-w-md w-full text-center">
                <ShieldCheck className="w-12 h-12 mx-auto text-red-600 mb-4" />

                <h2 className="text-lg font-semibold text-gray-400">STEP 2 OF 4</h2>
                <h1 className="text-2xl font-bold mb-2">Great, now let us verify your email</h1>
                <p className="text-gray-400 text-sm mb-6">
                    Click the link we sent to <span className="font-bold">{email}</span> to verify.
                    <br />
                    Verifying your email will improve account security and help you receive important Netflix communications.
                </p>

                <button
                    className="bg-red-600 p-3 rounded font-semibold w-full hover:bg-red-700 transition"
                    onClick={() => router.push("/signup/verify-email")}
                    suppressHydrationWarning
                >
                    Resend Email
                </button>

                {/* Skip Verification */}
                <button
                    className="bg-gray-500 p-3 rounded font-semibold w-full mt-3 hover:bg-gray-600 transition"
                    onClick={() => router.push("/browse")}
                    suppressHydrationWarning
                >
                    Skip
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;
