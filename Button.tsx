import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseButtonClass = 'btn-base-element';
  const variantClass = `btn-variant-${variant}`;
  const sizeClass = `btn-size-${size}`;
  const disabledClass = disabled ? 'btn-state-disabled' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseButtonClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;