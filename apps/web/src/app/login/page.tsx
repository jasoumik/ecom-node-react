"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Dispatch storage event to update header immediately
        window.dispatchEvent(new Event("storage"));
        
        addToast("Logged in successfully!", "success");
        if (data.user.role === 'admin') {
            router.push("/admin");
        } else {
            router.push("/");
        }
      } else {
        addToast("Login failed. Check your credentials.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Error logging in.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <Heading className="text-3xl font-serif text-slate-900 dark:text-white mb-2">Welcome Back</Heading>
          <Text className="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</Text>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="mt-8 text-center">
            <Text className="text-slate-500 dark:text-slate-400">
              Don't have an account? <a href="/register" className="text-sky-600 font-bold hover:text-sky-700 hover:underline dark:text-sky-400">Create account</a>
            </Text>
        </div>
      </div>
    </div>
  );
}
