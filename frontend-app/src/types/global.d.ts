// Ambient module declarations for non-TS assets used by the vitrine entry

declare module '*.css' {
  const content: string;
  export default content;
}

// Explicitly declare CSS package paths used by dynamic imports
declare module 'slick-carousel/slick/slick.css' {
  const content: string;
  export default content;
}
declare module 'bootstrap/dist/css/bootstrap.min.css' {
  const content: string;
  export default content;
}
declare module 'bootstrap-icons/font/bootstrap-icons.css' {
  const content: string;
  export default content;
}

// Minimal react-router-dom declarations to satisfy TS when dynamically importing in index.tsx
declare module 'react-router-dom' {
  export const RouterProvider: any;
  export function createBrowserRouter(...args: any[]): any;
  export const Link: any;
  export const Outlet: any;
  export function useNavigate(): any;
  export function useLocation(): any;
}