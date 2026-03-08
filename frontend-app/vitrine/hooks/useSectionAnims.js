import { useEffect, useRef, useState } from 'react';

/**
 * Triggers visibility when element scrolls into view.
 * Returns [ref, isVisible]
 */
export function useScrollReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

/**
 * Types out plainText character by character once `start` is true.
 * Returns the currently typed string.
 */
export function useTypingEffect(plainText, start, speed = 36) {
  const [typed, setTyped] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!start) return;
    let i = 0;
    setTyped('');
    timerRef.current = setInterval(() => {
      if (i < plainText.length) {
        setTyped(plainText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timerRef.current);
      }
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [start, plainText, speed]);

  return typed;
}
