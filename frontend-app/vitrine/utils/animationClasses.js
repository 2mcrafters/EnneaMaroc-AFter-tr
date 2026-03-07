// Animation utility classes for consistent usage across components
export const ANIMATION_CLASSES = {
  // Fade animations
  FADE_IN: 'animate-fade-in',
  FADE_IN_UP: 'animate-fade-in-up',
  FADE_IN_DOWN: 'animate-fade-in-down',
  FADE_IN_LEFT: 'animate-fade-in-left',
  FADE_IN_RIGHT: 'animate-fade-in-right',

  // Scale animations
  SCALE_IN: 'animate-scale-in',
  SCALE_IN_BOUNCE: 'animate-scale-in-bounce',

  // Slide animations
  SLIDE_IN_UP: 'animate-slide-in-up',
  SLIDE_IN_DOWN: 'animate-slide-in-down',

  // Rotate animations
  ROTATE_IN: 'animate-rotate-in',

  // Continuous animations
  FLOAT: 'animate-float',
  PULSE: 'animate-pulse',
  BOUNCE: 'animate-bounce',
  SHAKE: 'animate-shake',

  // Hover effects
  HOVER_LIFT: 'hover-lift',
  HOVER_SCALE: 'hover-scale',
  HOVER_ROTATE: 'hover-rotate',
  HOVER_GLOW: 'hover-glow',

  // Image effects
  IMAGE_ZOOM: 'image-hover-zoom',
  IMAGE_BLUR: 'image-hover-blur',

  // Text effects
  TEXT_COLOR: 'text-hover-color',
  TEXT_UNDERLINE: 'text-hover-underline',

  // Card effects
  CARD_HOVER: 'card-hover',

  // Icon effects
  ICON_SPIN: 'icon-hover-spin',
  ICON_BOUNCE: 'icon-hover-bounce',

  // Animation delays
  DELAY_100: 'animate-delay-100',
  DELAY_200: 'animate-delay-200',
  DELAY_300: 'animate-delay-300',
  DELAY_400: 'animate-delay-400',
  DELAY_500: 'animate-delay-500',
  DELAY_700: 'animate-delay-700',
  DELAY_1000: 'animate-delay-1000',

  // Animation speeds
  FAST: 'animate-fast',
  NORMAL: 'animate-normal',
  SLOW: 'animate-slow',
  SLOWER: 'animate-slower',

  // Loading states
  LOADING_SPINNER: 'loading-spinner',
  LOADING_PULSE: 'loading-pulse',
  LOADING_DOTS: 'loading-dots',

  // Scroll animations
  SCROLL_REVEAL: 'scroll-reveal',

  // Button classes
  BTN_PRIMARY: 'btn-primary',
  BTN_SECONDARY: 'btn-secondary',
  BTN_WHITE: 'btn-white',
  BTN_RIPPLE: 'btn-ripple',
  BTN_LOADING: 'btn-loading'
};

// Pre-configured animation combinations
export const ANIMATION_COMBOS = {
  // Entry animations
  ENTRY_HERO: [ANIMATION_CLASSES.FADE_IN_UP, ANIMATION_CLASSES.SLOW].join(' '),
  ENTRY_CARD: [ANIMATION_CLASSES.SCALE_IN, ANIMATION_CLASSES.NORMAL].join(' '),
  ENTRY_LIST_ITEM: [ANIMATION_CLASSES.FADE_IN_LEFT, ANIMATION_CLASSES.NORMAL].join(' '),
  ENTRY_BUTTON: [ANIMATION_CLASSES.BOUNCE, ANIMATION_CLASSES.DELAY_300].join(' '),

  // Hover combinations
  HOVER_CARD_LIFT: [ANIMATION_CLASSES.CARD_HOVER, ANIMATION_CLASSES.HOVER_LIFT].join(' '),
  HOVER_BUTTON: [ANIMATION_CLASSES.HOVER_LIFT, ANIMATION_CLASSES.HOVER_GLOW].join(' '),
  HOVER_IMAGE: [ANIMATION_CLASSES.IMAGE_ZOOM, ANIMATION_CLASSES.HOVER_SCALE].join(' '),

  // Loading combinations
  LOADING_BUTTON: [ANIMATION_CLASSES.BTN_LOADING, ANIMATION_CLASSES.LOADING_SPINNER].join(' '),
  LOADING_CARD: [ANIMATION_CLASSES.LOADING_PULSE, ANIMATION_CLASSES.PULSE].join(' '),

  // Interactive combinations
  INTERACTIVE_ICON: [ANIMATION_CLASSES.ICON_BOUNCE, ANIMATION_CLASSES.TEXT_COLOR].join(' '),
  INTERACTIVE_LINK: [ANIMATION_CLASSES.TEXT_UNDERLINE, ANIMATION_CLASSES.TEXT_COLOR].join(' ')
};

// Animation duration constants (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 800,
  VERY_SLOW: 1200
};

// Stagger delay constants (in milliseconds)
export const STAGGER_DELAYS = {
  FAST: 50,
  NORMAL: 100,
  SLOW: 200,
  SLOWER: 300
};

// Intersection Observer options for scroll animations
export const SCROLL_ANIMATION_OPTIONS = {
  DEFAULT: {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  },
  EARLY: {
    threshold: 0.05,
    rootMargin: '0px 0px -100px 0px'
  },
  LATE: {
    threshold: 0.3,
    rootMargin: '0px 0px 0px 0px'
  },
  ONCE: {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true
  }
};

// Helper functions for animation classes
export const animationHelpers = {
  // Combine multiple animation classes
  combine: (...classes) => classes.filter(Boolean).join(' '),
  
  // Add delay to animation
  withDelay: (baseClass, delayMs) => {
    const delayClass = Object.entries(ANIMATION_CLASSES)
      .find(([key, value]) => key.includes('DELAY') && value.includes(delayMs.toString()));
    return delayClass ? `${baseClass} ${delayClass[1]}` : baseClass;
  },
  
  // Add speed to animation
  withSpeed: (baseClass, speed) => {
    const speedClass = ANIMATION_CLASSES[speed.toUpperCase()];
    return speedClass ? `${baseClass} ${speedClass}` : baseClass;
  },
  
  // Create staggered classes for lists
  createStaggered: (baseClass, count, delay = STAGGER_DELAYS.NORMAL) => {
    return Array.from({ length: count }, (_, index) => 
      animationHelpers.withDelay(baseClass, delay * index)
    );
  },
  
  // Get responsive animation class
  getResponsive: (animation, breakpoint = 'md') => {
    return `${breakpoint}:${animation}`;
  }
};

// CSS custom properties for dynamic animations
export const ANIMATION_CSS_VARS = {
  '--animation-duration-fast': '0.2s',
  '--animation-duration-normal': '0.3s',
  '--animation-duration-slow': '0.5s',
  '--animation-duration-slower': '0.8s',
  '--ease-in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
  '--ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  '--ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// Pre-built component animation configs
export const COMPONENT_ANIMATIONS = {
  HERO_SECTION: {
    container: ANIMATION_CLASSES.FADE_IN,
    title: animationHelpers.combine(
      ANIMATION_CLASSES.FADE_IN_UP, 
      ANIMATION_CLASSES.SLOW, 
      ANIMATION_CLASSES.DELAY_200
    ),
    subtitle: animationHelpers.combine(
      ANIMATION_CLASSES.FADE_IN_UP, 
      ANIMATION_CLASSES.NORMAL, 
      ANIMATION_CLASSES.DELAY_400
    ),
    button: animationHelpers.combine(
      ANIMATION_CLASSES.SCALE_IN_BOUNCE, 
      ANIMATION_CLASSES.DELAY_600
    )
  },
  
  CARD_GRID: {
    container: ANIMATION_CLASSES.FADE_IN_UP,
    card: animationHelpers.combine(
      ANIMATION_CLASSES.SCALE_IN, 
      ANIMATION_CLASSES.HOVER_LIFT, 
      ANIMATION_CLASSES.CARD_HOVER
    ),
    image: ANIMATION_CLASSES.IMAGE_ZOOM,
    title: ANIMATION_CLASSES.TEXT_COLOR,
    button: animationHelpers.combine(
      ANIMATION_CLASSES.HOVER_GLOW, 
      ANIMATION_CLASSES.BTN_RIPPLE
    )
  },
  
  NAVIGATION: {
    logo: animationHelpers.combine(
      ANIMATION_CLASSES.FADE_IN_LEFT, 
      ANIMATION_CLASSES.HOVER_SCALE
    ),
    menuItem: ANIMATION_CLASSES.TEXT_UNDERLINE,
    socialIcon: animationHelpers.combine(
      ANIMATION_CLASSES.ICON_BOUNCE, 
      ANIMATION_CLASSES.TEXT_COLOR
    ),
    button: animationHelpers.combine(
      ANIMATION_CLASSES.HOVER_LIFT, 
      ANIMATION_CLASSES.BTN_RIPPLE
    )
  },
  
  TESTIMONIALS: {
    container: ANIMATION_CLASSES.FADE_IN_UP,
    card: animationHelpers.combine(
      ANIMATION_CLASSES.SLIDE_IN_UP, 
      ANIMATION_CLASSES.CARD_HOVER
    ),
    avatar: ANIMATION_CLASSES.IMAGE_ZOOM,
    stars: ANIMATION_CLASSES.PULSE
  }
};

export default {
  ANIMATION_CLASSES,
  ANIMATION_COMBOS,
  ANIMATION_DURATIONS,
  STAGGER_DELAYS,
  SCROLL_ANIMATION_OPTIONS,
  animationHelpers,
  ANIMATION_CSS_VARS,
  COMPONENT_ANIMATIONS
};
