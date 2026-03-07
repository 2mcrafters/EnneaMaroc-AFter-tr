import React from 'react';

type Props = React.SVGProps<SVGSVGElement> & { filled?: boolean };

export const PencilIcon: React.FC<Props> = ({ filled = false, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 3.487a2.126 2.126 0 1 1 3.005 3.005L7.5 18.86l-4.125.458a.75.75 0 0 1-.83-.83L3 14.363 16.862 3.487z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 7.5L16.5 4.5"
    />
  </svg>
);

export default PencilIcon;
