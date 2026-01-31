"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { OtpInput } from "@/components/ui/OtpInput";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        addToast(t('login_failed'), "error");
        setIsLoading(false);
      }
    } catch (error) {
      addToast(t('error'), "error");
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!identifier) {
          addToast(t('error'), "error");
          return;
      }
      setIsLoading(true);
      try {
          const res = await fetch(`${API_URL}/auth/otp/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier }),
          });
          if (res.ok) {
              setOtpSent(true);
              addToast(t('otp_sent_success'), "success");
          } else {
              addToast(t('otp_send_failed'), "error");
          }
      } catch (e) {
          addToast(t('error'), "error");
      } finally {
          setIsLoading(false);
      }
  };

  const handleVerifyOtp = async () => {
      setIsLoading(true);
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
              addToast(t('invalid_otp'), "error");
              setIsLoading(false);
          }
      } catch (e) {
          addToast(t('error'), "error");
          setIsLoading(false);
      }
  };

  const handleSuccess = (data: any) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("storage"));
    addToast(t('login_success'), "success");
    if (data.user.role === 'admin') {
        router.push("/admin");
    } else {
        router.push("/");
    }
    // Don't set isLoading(false) here to prevent flash of login form before redirect
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-6">
          <Heading className="text-2xl font-serif text-slate-900 dark:text-white mb-1">{t('welcome_back')}</Heading>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{t('sign_in_details')}</Text>
        </div>
        
        {/* Toggle Login Method */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
            <button 
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isOtpLogin ? 'bg-white dark:bg-slate-600 shadow-sm text-sky-600' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => { setIsOtpLogin(false); setOtpSent(false); }}
                disabled={isLoading}
            >
                {t('password')}
            </button>
            <button 
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isOtpLogin ? 'bg-white dark:bg-slate-600 shadow-sm text-sky-600' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setIsOtpLogin(true)}
                disabled={isLoading}
            >
                {t('otp_login')}
            </button>
        </div>
        
        {!isOtpLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
            <Input
                label={t('phone_number')}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('phone_email_placeholder')}
                required
                className="py-2.5 text-sm"
                disabled={isLoading}
            />
            <Input
                label={t('password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                required
                className="py-2.5 text-sm"
                disabled={isLoading}
            />
            
            <Button fullWidth type="submit" disabled={isLoading} className="py-2.5 text-base font-bold shadow-lg shadow-sky-500/20 rounded-xl">
                {isLoading ? t('loading') : t('sign_in')}
            </Button>
            </form>
        ) : (
            <div className="space-y-4">
                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <Input
                            label={t('phone_number')}
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={t('phone_email_placeholder')}
                            required
                            className="py-2.5 text-sm"
                            disabled={isLoading}
                        />
                        <Button fullWidth type="submit" disabled={isLoading} className="py-2.5 text-base font-bold shadow-lg shadow-sky-500/20 rounded-xl">
                            {isLoading ? t('loading') : t('send_otp')}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-3">{t('enter_otp_code', { identifier })}</p>
                            <OtpInput length={6} onComplete={(val) => setOtp(val)} />
                        </div>
                        <Button fullWidth onClick={handleVerifyOtp} disabled={isLoading} className="py-2.5 text-base font-bold shadow-lg shadow-sky-500/20 rounded-xl">
                            {isLoading ? t('loading') : t('verify_login')}
                        </Button>
                        <button onClick={() => setOtpSent(false)} disabled={isLoading} className="w-full text-center text-xs text-sky-500 hover:underline">
                            {t('change_number_email')}
                        </button>
                    </div>
                )}
            </div>
        )}
        
        <div className="mt-6 text-center">
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {t('dont_have_account')} <Link href="/register" className="text-sky-600 font-bold hover:text-sky-700 hover:underline dark:text-sky-400">{t('create_account')}</Link>
            </Text>
        </div>
      </div>
    </div>
  );
}
