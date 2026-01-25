"use client";

import { useState } from "react";
import { Heading, Text, Button, Section } from "@repo/ui";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { API_URL } from "@/lib/config";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const res = await fetch(`${API_URL}/requests/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        
        if (res.ok) {
            addToast("Message sent successfully! We'll get back to you soon.", "success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } else {
            addToast("Failed to send message. Please try again.", "error");
        }
    } catch (e) {
        addToast("Error sending message", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-sky-50 dark:bg-slate-900 py-16 text-center">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">Contact Us</Heading>
        <Text className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          We're here to help. Reach out to us for any questions, support, or feedback.
        </Text>
      </div>

      <Section>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Whether you have a question about products, shipping, or just want to say hello, our team is ready to answer all your questions.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl text-sky-600">📍</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Visit Us</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    House 12, Road 5, Dhanmondi<br />
                    Dhaka-1209, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl text-sky-600">📞</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Call Us</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    +880 1616-684803<br />
                    Sun-Thu, 9am - 6pm
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl text-sky-600">✉️</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Email Us</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    support@prithibee.com<br />
                    info@prithibee.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Your Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="bg-slate-50/50"
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                className="bg-slate-50/50"
              />
              <Input 
                label="Subject" 
                value={formData.subject} 
                onChange={e => setFormData({...formData, subject: e.target.value})} 
                required 
                className="bg-slate-50/50"
              />
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  required 
                  rows={4}
                  placeholder="How can we help you?"
                />
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                disabled={isSubmitting}
                className="rounded-xl py-3 text-base shadow-lg shadow-sky-500/20"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
