import React from "react";
import "../styles/logo.css";
import { getAssetUrl } from "../services/baseApi";

interface LogoProps {
  className?: string;
}
const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* Use the logo.png from public/ so it's served at /logo.png */}
      <img
        src="/assets/images/logo/logo.png"
        alt="EnneaMaroc"
        className="h-full w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
