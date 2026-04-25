"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = ({
  id,
  label,
  type,
  error,
  className,
  ...props
}: FloatingInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  const inputType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="relative flex items-center w-full group">
      <input
        {...props}
        id={id}
        type={inputType}
        placeholder=" "
        className={`
          glass-input peer w-full outline-none transition-all duration-200 bg-transparent rounded-xl
          /* Padding */
          px-4 pt-6 pb-2 
          tablet:pt-7 tablet:pb-3
          2k:px-6 2k:pt-10 2k:pb-4 
          4k:px-12 4k:pt-20 4k:pb-8
          /* Texte */
          text-sm tablet:text-base 2k:text-2xl 4k:text-3xl
          text-cream
          /* Bordures & Focus */
          ${error ? "border-red-400 focus:border-red-400" : "border-cream/20 focus:border-blue"}
          ${className}
        `}
      />

      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-4 tablet:right-5 2k:right-8 4k:right-12 text-cream/50 hover:text-cream transition-colors focus:outline-none"
        >
          <div className="block 4k:hidden 2k:hidden">
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </div>
          <div className="hidden 2k:block 4k:hidden">
            {showPassword ? <EyeOff size={28} aria-hidden="true" /> : <Eye size={28} aria-hidden="true" />}
          </div>
          <div className="hidden 4k:block">
            {showPassword ? <EyeOff size={56} aria-hidden="true" /> : <Eye size={56} aria-hidden="true" />}
          </div>
        </button>
      )}

      <label
        htmlFor={id}
        className={`
          absolute left-4 tablet:left-4 2k:left-6 4k:left-12
          transition-all duration-300 pointer-events-none origin-left
          
          /* État par défaut : Centré parfaitement */
          top-1/2 -translate-y-1/2 scale-100
          text-xs tablet:text-sm 2k:text-xl 4k:text-3xl
          
          peer-focus:top-0 tablet:peer-focus:top-0 2k:peer-focus:top-0 4k:peer-focus:top-1
          peer-focus:translate-y-0 peer-focus:scale-75
          
          peer-not-placeholder-shown:top-1 tablet:peer-not-placeholder-shown:top-1.5 2k:peer-not-placeholder-shown:top-2 4k:peer-not-placeholder-shown:top-4
          peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:scale-75

          ${error ? "text-red-400" : "text-cream/50 peer-focus:text-blue"}
        `}
      >
        {label}
      </label>
    </div>
  );
};
