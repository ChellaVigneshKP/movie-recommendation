/* eslint-disable @next/next/no-img-element */
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
    <div className="relative w-full min-h-screen bg-black">
      <div className="relative w-full h-screen flex flex-col justify-center items-center">
        <Image
          src="/login-banner.jpg"
          fill
          style={{ objectFit: "cover" }}
          alt="Netflix Background"
          priority
          className="absolute inset-0 opacity-50"
        />
        <div className="absolute top-5 left-5">
          <Image src="/logo.png" alt="My Logo" width={48} height={48} className="h-12 w-auto" />
        </div>
        <div className="absolute top-5 right-5 p-5">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border border-gray-500 px-3 py-1 rounded-md bg-black bg-opacity-50 text-white cursor-pointer">
              <FaGlobe />
              <span>English</span>
            </div>
            <button
              className="bg-red-600 px-4 py-1 rounded-md text-white cursor-pointer font-semibold hover:bg-red-700 transition"
              onClick={() => router.push("/login")}
              suppressHydrationWarning
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
                onKeyDown={(e) => e.key === "Enter" && handleGetStarted()}
                suppressHydrationWarning
              />
              <p className="text-red-500 text-sm mt-1 h-5">
                {isTouched && !isValid ? "Please enter a valid email address." : ""}
              </p>
            </div>
            <button
              className="bg-red-600 text-white px-6 py-4 cursor-pointer rounded-md font-semibold hover:bg-red-700 transition"
              onClick={handleGetStarted}
              suppressHydrationWarning
            >
              Get Started →
            </button>
          </div>
        </div>
      </div>
      <div className='h-2 w-full bg-[#232323]' aria-hidden='true' />
      <div className='py-10 bg-black text-white'>
        <div className='flex max-w-6xl mx-auto items-center justify-center md:flex-row flex-col px-4 md:px-2'>
          <div className='flex-1 text-center md:text-left'>
            <h2 className='text-4xl md:text-5xl font-extrabold mb-4'>Enjoy on your TV</h2>
            <p className='text-lg md:text-xl'>
              Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.
            </p>
          </div>
          <div className='flex-1 relative'>
            <img src='/assets/tv.png' alt='Tv Image' className='mt-4 z-20 relative' />
            <video
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1/2 z-10'
              playsInline
              autoPlay={true}
              muted
              loop
            >
              <source src='/assets/hero-vid.m4v' type='video/mp4' />
            </video>
          </div>
        </div>
      </div>
      <div className='h-2 w-full bg-[#232323]' aria-hidden='true' />
      <div className='py-10 bg-black text-white'>
        <div className='flex max-w-6xl mx-auto items-center justify-center md:flex-row flex-col-reverse px-4 md:px-2'>
          <div className='flex-1 relative'>
            <div className='relative'>
              <img src='/assets/stranger-things-lg.png' alt='Stranger Things img' className='mt-4' />

              <div
                className='flex items-center gap-2 absolute bottom-5 left-1/2 -translate-x-1/2 bg-black
              w-3/4 lg:w-1/2 h-24 border border-slate-500 rounded-md px-2
              '
              >
                <img src='/assets/stranger-things-sm.png' alt='image' className='h-full' />
                <div className=' flex justify-between items-center w-full'>
                  <div className='flex flex-col gap-0'>
                    <span className='text-md lg:text-lg font-bold'>Stranger Things</span>
                    <span className='text-sm text-blue-500'>Downloading...</span>
                  </div>

                  <img src='/assets/download-icon.gif' alt='' className='h-12' />
                </div>
              </div>
            </div>
          </div>
          <div className='flex-1 md:text-left text-center'>
            <h2 className='text-4xl md:text-5xl font-extrabold mb-4 text-balance'>
              Download your shows to watch offline
            </h2>
            <p className='text-lg md:text-xl'>
              Save your favorites easily and always have something to watch.
            </p>
          </div>
        </div>
      </div>
      <div className='h-2 w-full bg-[#232323]' aria-hidden='true' />
      <div className='py-10 bg-black text-white'>
				<div className='flex max-w-6xl mx-auto items-center justify-center md:flex-row flex-col px-4 md:px-2'>
					<div className='flex-1 text-center md:text-left'>
						<h2 className='text-4xl md:text-5xl font-extrabold mb-4'>Watch everywhere</h2>
						<p className='text-lg md:text-xl'>
							Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.
						</p>
					</div>
					<div className='flex-1 relative overflow-hidden'>
						<img src='/assets/device-pile.png' alt='Device Image' className='mt-4 z-20 relative' />
						<video
							className='absolute top-2 left-1/2 -translate-x-1/2  h-4/6 z-10
               max-w-[63%]
              '
							playsInline
							autoPlay={true}
							muted
							loop
						>
							<source src='/assets/video-devices.m4v' type='video/mp4' />
						</video>
					</div>
				</div>
			</div>
      <div className='h-2 w-full bg-[#232323]' aria-hidden='true' />
      <div className='py-10 bg-black text-white'>
				<div
					className='flex max-w-6xl mx-auto items-center justify-center flex-col-reverse md:flex-row
           px-4 md:px-2
        '
				>
					<div className='flex-1 relative'>
						<img src='/assets/kids.png' alt='Enjoy on your TV' className='mt-4' />
					</div>
					<div className='flex-1 text-center md:text-left'>
						<h2 className='text-4xl md:text-5xl font-extrabold mb-4'>Create profiles for kids</h2>
						<p className='text-lg md:text-xl'>
							Send kids on adventures with their favorite characters in a space made just for them—free
							with your membership.
						</p>
					</div>
				</div>
			</div>

      <footer className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-sm text-center w-full">
        Made with ❤️ by <br />
        Chella Vignesh K P [M24DE3025] & Dinesh Periyasamy [M24DE3026]
      </footer>
    </div>
  );
};

export default Home;
