"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { OtpInput } from "@/components/ui/OtpInput";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        handleSuccess(data);
      } else {
        addToast("Login failed. Check your credentials.", "error");
      }
    } catch (error) {
      addToast("Error logging in.", "error");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!identifier) {
          addToast("Please enter phone or email", "error");
          return;
      }
      try {
          const res = await fetch(`${API_URL}/auth/otp/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier }),
          });
          if (res.ok) {
              setOtpSent(true);
              addToast("OTP sent successfully", "success");
          } else {
              addToast("Failed to send OTP", "error");
          }
      } catch (e) {
          addToast("Error sending OTP", "error");
      }
  };

  const handleVerifyOtp = async () => {
      try {
          const res = await fetch(`${API_URL}/auth/otp/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier, otp }),
          });
          if (res.ok) {
              const data = await res.json();
              handleSuccess(data);
          } else {
              addToast("Invalid OTP", "error");
          }
      } catch (e) {
          addToast("Error verifying OTP", "error");
      }
  };

  const handleSuccess = (data: any) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("storage"));
    addToast("Logged in successfully!", "success");
    if (data.user.role === 'admin') {
        router.push("/admin");
    } else {
        router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <Heading className="text-3xl font-serif text-slate-900 dark:text-white mb-2">Welcome Back</Heading>
          <Text className="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</Text>
        </div>
        
        {/* Toggle Login Method */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
            <button 
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isOtpLogin ? 'bg-white dark:bg-slate-600 shadow-sm text-sky-600' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => { setIsOtpLogin(false); setOtpSent(false); }}
            >
                Password
            </button>
            <button 
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isOtpLogin ? 'bg-white dark:bg-slate-600 shadow-sm text-sky-600' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setIsOtpLogin(true)}
            >
                OTP (SMS/Email)
            </button>
        </div>
        
        {!isOtpLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
            <Input
                label="Phone Number or Email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="017... or you@example.com"
                required
            />
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
            />
            
            <Button fullWidth type="submit" className="py-3 text-lg font-bold shadow-lg shadow-sky-500/20">
                Sign In
            </Button>
            </form>
        ) : (
            <div className="space-y-6">
                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <Input
                            label="Phone Number or Email"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="017... or you@example.com"
                            required
                        />
                        <Button fullWidth type="submit" className="py-3 text-lg font-bold shadow-lg shadow-sky-500/20">
                            Send OTP
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center">
                            <p className="text-sm text-slate-500 mb-4">Enter the 6-digit code sent to {identifier}</p>
                            <OtpInput length={6} onComplete={(val) => setOtp(val)} />
                        </div>
                        <Button fullWidth onClick={handleVerifyOtp} className="py-3 text-lg font-bold shadow-lg shadow-sky-500/20">
                            Verify & Login
                        </Button>
                        <button onClick={() => setOtpSent(false)} className="w-full text-center text-sm text-sky-500 hover:underline">
                            Change Number/Email
                        </button>
                    </div>
                )}
            </div>
        )}
        
        <div className="mt-8 text-center">
            <Text className="text-slate-500 dark:text-slate-400">
              Don't have an account? <a href="/register" className="text-sky-600 font-bold hover:text-sky-700 hover:underline dark:text-sky-400">Create account</a>
            </Text>
        </div>
      </div>
    </div>
  );
}
