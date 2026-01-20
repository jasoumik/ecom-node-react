"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (res.ok) {
        router.push("/login");
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error registering");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <Heading className="text-3xl font-serif text-slate-900 dark:text-white mb-2">Join Prithibee</Heading>
          <Text className="text-slate-500 dark:text-slate-400">Create an account to start your journey.</Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
          <Button fullWidth type="submit" className="py-3 text-lg font-bold shadow-lg shadow-rose-500/20">
            Create Account
          </Button>
        </form>
        
        <div className="mt-8 text-center">
            <Text className="text-slate-500 dark:text-slate-400">
              Already have an account? <a href="/login" className="text-rose-600 font-bold hover:text-rose-700 hover:underline dark:text-rose-400">Sign in</a>
            </Text>
        </div>
      </div>
    </div>
  );
}
