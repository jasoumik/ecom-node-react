import * as React from "react";

export interface RatingStarsProps {
  rating: number; // 0-5
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => {
  const fullStars = Math.round(rating);

  return (
    <div className="flex items-center gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < fullStars ? "★" : "☆"}</span>
      ))}
    </div>
  );
};
