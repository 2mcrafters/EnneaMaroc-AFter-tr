import React from 'react';

interface IconProps {
  className?: string;
}

export const BankIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l18 0" />
    <path d="M3 10l18 0" />
    <path d="M5 6l7 -3l7 3" />
    <path d="M4 10l0 11" />
    <path d="M20 10l0 11" />
    <path d="M8 14l0 3" />
    <path d="M12 14l0 3" />
    <path d="M16 14l0 3" />
  </svg>
);
