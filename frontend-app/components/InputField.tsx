
import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  pattern?: string;
  title?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  className = '', 
  disabled = false,
  pattern,
  title,
  onBlur,
  error
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        pattern={pattern}
        title={title}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none focus:ring-1 
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pistachio-dark focus:border-pistachio-dark'}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InputField;
