import { useEffect, useRef, useState } from 'react';

/**
 * Hook for scroll-based animations using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Threshold for triggering animation (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @returns {Object} - { ref, isInView, hasAnimated }
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options;

  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            setHasAnimated(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isInView, hasAnimated };
};

/**
 * Hook for staggered animations (multiple elements with delays)
 * @param {number} count - Number of elements to animate
 * @param {number} delay - Delay between each element animation (in ms)
 * @param {Object} options - Scroll animation options
 * @returns {Array} - Array of refs and animation states
 */
export const useStaggeredAnimation = (count, delay = 100, options = {}) => {
  const [animationStates, setAnimationStates] = useState(
    Array(count).fill(false)
  );
  const { ref, isInView } = useScrollAnimation(options);

  useEffect(() => {
    if (isInView) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          setAnimationStates(prev => {
            const newStates = [...prev];
            newStates[i] = true;
            return newStates;
          });
        }, i * delay);
      }
    }
  }, [isInView, count, delay]);

  return { containerRef: ref, animationStates, isInView };
};

/**
 * Hook for parallax scrolling effect
 * @param {number} speed - Speed of parallax effect (0-1, where 1 is normal scroll speed)
 * @returns {Object} - { ref, transform }
 */
export const useParallax = (speed = 0.5) => {
  const ref = useRef(null);
  const [transform, setTransform] = useState('translateY(0px)');

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;

      // Only apply parallax when element is in viewport
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        setTransform(`translateY(${rate}px)`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, transform };
};

/**
 * Hook for hover animations with customizable effects
 * @param {Object} effects - Animation effects configuration
 * @returns {Object} - { ref, isHovered, styles }
 */
export const useHoverAnimation = (effects = {}) => {
  const {
    scale = 1.05,
    rotate = 0,
    translateY = -4,
    opacity = 1,
    duration = 300
  } = effects;

  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isHovered 
      ? `scale(${scale}) rotate(${rotate}deg) translateY(${translateY}px)`
      : 'scale(1) rotate(0deg) translateY(0px)',
    opacity: isHovered ? opacity : 1
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { ref, isHovered, styles };
};

/**
 * Hook for typewriter effect animation
 * @param {string} text - Text to animate
 * @param {number} speed - Typing speed in milliseconds
 * @param {number} delay - Initial delay before starting
 * @returns {Object} - { displayText, isComplete }
 */
export const useTypewriter = (text, speed = 50, delay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let currentIndex = 0;
      
      const timer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(timer);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
};

/**
 * Hook for counter animation
 * @param {number} end - End value for counter
 * @param {number} duration - Animation duration in milliseconds
 * @param {number} start - Start value for counter
 * @param {boolean} trigger - Whether to start the animation
 * @returns {number} - Current counter value
 */
export const useCounterAnimation = (end, duration = 2000, start = 0, trigger = true) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!trigger) return;

    let startTime = null;
    const startValue = start;
    const endValue = end;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start, trigger]);

  return count;
};

/**
 * Hook for managing loading states with animations
 * @param {boolean} isLoading - Loading state
 * @param {number} minDuration - Minimum loading duration in ms
 * @returns {Object} - { isLoading, isVisible, progress }
 */
export const useLoadingAnimation = (isLoading, minDuration = 500) => {
  const [isVisible, setIsVisible] = useState(isLoading);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Complete progress and hide after minimum duration
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
      }, minDuration);
    }
  }, [isLoading, minDuration]);

  return { isLoading, isVisible, progress };
};

export default {
  useScrollAnimation,
  useStaggeredAnimation,
  useParallax,
  useHoverAnimation,
  useTypewriter,
  useCounterAnimation,
  useLoadingAnimation
};
