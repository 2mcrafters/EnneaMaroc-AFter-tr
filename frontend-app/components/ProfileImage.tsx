import React, { useState } from 'react';
import { getProfileImageUrl } from '../services/baseApi';

interface ProfileImageProps {
  profilePicture?: string | null;
  alt?: string;
  className?: string;
  fallbackName?: string;
  size?: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  profilePicture, 
  alt = 'Profile', 
  className = '', 
  fallbackName = 'User',
  size = 128 
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const getFallbackUrl = () => {
    // Use external service for personalized avatars if name is provided, otherwise use local SVG
    if (fallbackName && fallbackName !== 'User') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=e2e8f0&color=475569&size=${size}`;
    }
    return '/default-avatar.svg';
  };

  const imageUrl = hasError ? getFallbackUrl() : getProfileImageUrl(profilePicture);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default ProfileImage;
