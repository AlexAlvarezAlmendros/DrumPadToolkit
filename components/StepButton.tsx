import React from 'react';

interface StepButtonProps {
  isActive: boolean;
  isCurrent: boolean;
  isBeatMarker: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const StepButton: React.FC<StepButtonProps> = ({ isActive, isCurrent, isBeatMarker, onClick, disabled = false }) => {
  let baseClasses = "w-7 h-10 md:w-8 md:h-12 rounded transition-all duration-100 ease-in-out";
  
  if (disabled) {
    baseClasses += " opacity-50 cursor-not-allowed";
    if (isActive) {
      baseClasses += " bg-sky-800"; // Darker active color when disabled
    } else {
      baseClasses += isBeatMarker ? " bg-slate-700" : " bg-slate-800"; // Darker inactive colors
    }
  } else {
    baseClasses += " focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75";
    if (isCurrent) {
      baseClasses += isActive ? " bg-yellow-400 shadow-lg scale-105" : " bg-yellow-600 opacity-70 shadow-md scale-105";
    } else if (isActive) {
      baseClasses += " bg-sky-500 hover:bg-sky-400 shadow-md";
    } else {
      baseClasses += isBeatMarker ? " bg-slate-600 hover:bg-slate-500" : " bg-slate-700 hover:bg-slate-600";
    }
  }


  return (
    <button
      type="button"
      className={baseClasses}
      onClick={onClick}
      aria-pressed={isActive}
      disabled={disabled}
    />
  );
};

export default StepButton;