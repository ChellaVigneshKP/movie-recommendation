"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignOut = () => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            router.push("/");
        }, 30000); // Redirect after 30 seconds

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="relative w-full h-screen flex justify-center items-center bg-black text-white">
            {/* Background Blur */}
            <div className="absolute inset-0 opacity-50">
                            <Image
                                src="/signout.jpg"
                                fill
                                style={{ objectFit: "cover" }}
                                alt="Netflix Background"
                                priority
                            />
                        </div>
            <div className="absolute inset-0 opacity-50"></div>

            {/* Sign Out Box */}
            <div className="relative bg-black bg-opacity-80 p-10 rounded-lg text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">You have been signed out</h2>
                <p className="text-gray-400 text-sm mb-6">
                    Redirecting to the homepage in <span className="text-red-500 font-bold text-xl">{countdown}</span> seconds...
                </p>
                <button
                    className="bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
                    onClick={() => router.push("/")}
                >
                    Go to Homepage Now
                </button>
            </div>
        </div>
    );
};

export default SignOut;
