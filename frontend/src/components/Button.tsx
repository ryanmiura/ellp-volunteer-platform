import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  fullWidth?: boolean;
}

function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  
  const variantClasses = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400",
    secondary: "text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400",
    outline: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100",
    link: "text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline focus:ring-blue-500 disabled:text-blue-400"
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-60' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
