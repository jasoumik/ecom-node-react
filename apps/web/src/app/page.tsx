'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Phone } from 'lucide-react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set the date we're counting down to: Feb 17, 2026 (7 days from Feb 10, 2026)
    const targetDate = new Date('2026-02-17T00:00:00');
    const countDownDate = targetDate.getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 dark:bg-purple-900/20 blur-3xl"></div>
      </div>

      <div className="max-w-3xl w-full text-center space-y-10 z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48 md:w-88 md:h-88">
             <Image 
              src="/signboard.jpeg"
              alt="Prithibee Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          Coming Soon
        </h2>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          We are getting ready to launch something amazing. Stay tuned for the big reveal!
        </p>

        {/* Countdown Clock */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-8">
          <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
            <span className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.days}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Days</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
            <span className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.hours}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Hours</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
            <span className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.minutes}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Minutes</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
            <span className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.seconds}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Seconds</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
          <Link 
            href="https://facebook.com/prithibee.official" 
            target="_blank"
            className="flex items-center gap-3 px-8 py-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-blue-500/30 w-full md:w-auto justify-center"
          >
            <Facebook size={24} />
            <span className="font-medium">/prithibeeofficial</span>
          </Link>
          
          <a 
            href="https://wa.me/8801616684803"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-green-500/30 w-full md:w-auto justify-center"
          >
            <Phone size={24} />
            <span className="font-medium">+8801616-684803</span>
          </a>
        </div>
      </div>
    </div>
  );
}
