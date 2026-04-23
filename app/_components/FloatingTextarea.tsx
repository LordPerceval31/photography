"use client";

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FloatingTextarea = ({
  id,
  label,
  error,
  className,
  rows = 4,
  ...props
}: FloatingTextareaProps) => {
  return (
    <div className="relative flex w-full group">
      <textarea
        {...props}
        id={id}
        rows={rows}
        placeholder=" "
        className={`
          glass-input peer w-full outline-none transition-all duration-200 bg-transparent rounded-xl resize-none
          px-4 pt-6 pb-2 
          tablet:pt-7 tablet:pb-3
          2k:px-6 2k:pt-10 2k:pb-4 
          4k:px-12 4k:pt-20 4k:pb-8
          text-sm tablet:text-base 2k:text-2xl 4k:text-3xl
          text-cream
          
          /* Custom Scrollbar (Même design que le formulaire) */
          [&::-webkit-scrollbar]:w-1.5 tablet:[&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-cream/10 hover:[&::-webkit-scrollbar-thumb]:bg-cream/30 
          [&::-webkit-scrollbar-thumb]:rounded-full
          
          ${error ? "border-red-400 focus:border-red-400" : "border-cream/20 focus:border-blue"}
          ${className}
        `}
      />

      <label
        htmlFor={id}
        className={`
          absolute left-4 tablet:left-4 2k:left-6 4k:left-12
          transition-all duration-300 pointer-events-none origin-left
          
          /* État par défaut : Aligné sur la première ligne d'écriture (top-6 sans décalage y) */
          top-6 tablet:top-7 2k:top-10 4k:top-20 translate-y-0 scale-100
          text-xs tablet:text-sm 2k:text-xl 4k:text-3xl
          
          /* État : Focus ou Rempli (Collé tout en haut comme le Input : top-1) */
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
