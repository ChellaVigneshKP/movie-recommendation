import PropTypes from "prop-types";
import Image from "next/image";
import { Search, Bell, UserCircle, ChevronDown, ChevronUp } from "lucide-react";

const Navbar = ({ movie }) => {
    return (
        <header className="flex justify-between items-center px-6 md:px-10 py-4 fixed top-0 w-full bg-black bg-opacity-70 z-50">
            <div className="flex items-center gap-4 md:gap-8">
                <Image 
                    src="/logo.png" 
                    alt={movie?.title || "Netflix movie banner"} 
                    width={40} 
                    height={40} 
                    className="object-contain" 
                />

                {/* Mobile Dropdown */}
                <div className="relative md:hidden group">
                    <button className="flex items-center gap-1 text-white focus:outline-none">
                        <span>Menu</span>
                        <ChevronDown className="w-5 h-5 group-hover:hidden" />
                        <ChevronUp className="w-5 h-5 hidden group-hover:block" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full bg-black bg-opacity-90 rounded-md shadow-lg w-40 hidden group-hover:flex flex-col">
                        <a href="#" className="block py-2 px-4 text-white hover:bg-gray-700">Home</a>
                        <a href="#" className="block py-2 px-4 text-white hover:bg-gray-700">TV Shows</a>
                        <a href="#" className="block py-2 px-4 text-white hover:bg-gray-700">Movies</a>
                        <a href="#" className="block py-2 px-4 text-white hover:bg-gray-700">New & Popular</a>
                        <a href="#" className="block py-2 px-4 text-white hover:bg-gray-700">My List</a>
                    </div>
                </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6 text-gray-300">
                <a href="#" className="hover:text-white">Home</a>
                <a href="#" className="hover:text-white">TV Shows</a>
                <a href="#" className="hover:text-white">Movies</a>
                <a href="#" className="hover:text-white">New & Popular</a>
                <a href="#" className="hover:text-white">My List</a>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-5">
                <Search className="w-6 h-6 cursor-pointer hover:text-white" />
                <Bell className="w-6 h-6 cursor-pointer hover:text-white" />
                <UserCircle className="w-8 h-8 cursor-pointer hover:text-white" />
            </div>
        </header>
    );
};

Navbar.propTypes = {
    movie: PropTypes.shape({
        title: PropTypes.string,
    }),
};

export default Navbar;
