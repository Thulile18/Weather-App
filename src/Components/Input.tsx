import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void; 
  placeholder?: string;
  type?: 'text' | 'search' | 'number';
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  onKeyPress,
  disabled = false,
  label
}) => {
  return (
    <div className={`custom-input-group-container ${className}`}>
      {label && (
        <label className="custom-input-field-label">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={onKeyPress} 
        disabled={disabled}
        className={`custom-base-input-element ${disabled ? 'state-disabled-input' : ''}`}
      />
    </div>
  );
};

export default Input;