import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showScore = true,
  count,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentRating = interactive ? hoverRating || rating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer transition-transform hover:scale-110 focus:outline-none'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-0.5">
          {rating ? Number(rating).toFixed(1) : 'New'}
          {count !== undefined && (
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
              ({count})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
