"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("storage"));
        addToast(t('register_success'), "success");
        router.push("/");
      } else {
        addToast(t('register_failed'), "error");
      }
    } catch (error) {
      addToast(t('error'), "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <Heading className="text-3xl font-serif text-slate-900 dark:text-white mb-2">{t('create_account_title')}</Heading>
          <Text className="text-slate-500 dark:text-slate-400">{t('create_account_subtitle')}</Text>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <Input
            label={t('full_name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('full_name_placeholder')}
            required
          />
          <Input
            label={t('phone_number')}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="017..."
            required
          />
          <Input
            label={t('email_address')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password_placeholder')}
            required
          />
          
          <Button fullWidth type="submit" className="py-3 text-lg font-bold shadow-lg shadow-sky-500/20">
            {t('register')}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
            <Text className="text-slate-500 dark:text-slate-400">
              {t('already_have_account')} <Link href="/login" className="text-sky-600 font-bold hover:text-sky-700 hover:underline dark:text-sky-400">{t('login')}</Link>
            </Text>
        </div>
      </div>
    </div>
  );
}
