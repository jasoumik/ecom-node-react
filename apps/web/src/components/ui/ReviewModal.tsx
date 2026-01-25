"use client";

import { useState } from "react";
import { Button, Heading } from "@repo/ui";
import { Input } from "./Input";
import { API_URL } from "@/lib/config";
import { useToast } from "./Toast";
import { MediaPicker } from "./MediaPicker";

interface ReviewModalProps {
  productId: string;
  orderId: string;
  userId: string;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ productId, orderId, userId, productName, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderId, userId, rating, comment, images }),
      });
      
      if (res.ok) {
        addToast("Review submitted for approval!", "success");
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        addToast(err.message || "Failed to submit review", "error");
      }
    } catch (e) {
      addToast("Error submitting review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        <Heading size="lg" className="mb-2 text-slate-900 dark:text-white">Write a Review</Heading>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Share your experience with {productName}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Comment</label>
                <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    rows={4}
                    placeholder="What did you like or dislike?"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Photos (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden relative group">
                            <img src={img} alt="Review" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-sky-500 hover:text-sky-500 transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>
            
            <Button fullWidth type="submit" disabled={isSubmitting} className="rounded-xl py-3 mt-2">
                {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setImages([...images, url]);
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
