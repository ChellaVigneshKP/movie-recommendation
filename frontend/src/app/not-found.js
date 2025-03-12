import Link from "next/link";
import Image from "next/image";
export default function NotFound() {
    return (
        <div className="relative h-screen flex flex-col items-center justify-center text-white text-center bg-black">
            <div className="absolute inset-0">
                <Image
                    src="/assets/404.png"
                    alt="Lost in Space"
                    className="w-full h-full object-cover opacity-50"
                    fill
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

            <div className="relative z-10">
                <h1 className="text-5xl font-extrabold">Lost your way?</h1>
                <p className="mt-3 text-lg">
                    Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home page.
                </p>

                <Link href="/">
                    <button className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-lg">
                        Netflix Home
                    </button>
                </Link>

                <p className="mt-5 text-gray-300 text-sm">
                    <span className="text-red-600 font-bold">Error Code </span> NSES-404
                </p>
            </div>

            <p className="absolute bottom-5 text-gray-400 text-xs">
                FROM <span className="text-white font-bold">LOST IN SPACE</span>
            </p>
        </div>
    );
}