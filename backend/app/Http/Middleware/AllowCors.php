<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AllowCors
{
    private function getAllowedOrigins(): array
    {
        $allowed = array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))));

        // Always include common local dev origins
        $allowed = array_merge($allowed, [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5175',
            'http://localhost:5176',
            'http://127.0.0.1:5176',
            // Also allow plain localhost (some tools use it)
            'http://localhost',
            'http://127.0.0.1',
        ]);

        return array_values(array_unique($allowed));
    }

    private function isOriginAllowed(?string $origin): bool
    {
        if (!$origin) return false;

        // In local dev we accept any origin to avoid blocking tooling.
        if ((string) env('APP_ENV') === 'local') return true;

        return in_array($origin, $this->getAllowedOrigins(), true);
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');

        // Handle preflight requests first
        if ($request->getMethod() === 'OPTIONS') {
            $resp = response('', 204);

            if ($this->isOriginAllowed($origin)) {
                $resp->headers->set('Access-Control-Allow-Origin', $origin);
                $resp->headers->set('Vary', 'Origin');
                $resp->headers->set('Access-Control-Allow-Credentials', 'true');
            }

            $resp->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $resp->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept');
            $resp->headers->set('Access-Control-Max-Age', '3600');

            return $resp;
        }

        $response = $next($request);

        if ($this->isOriginAllowed($origin)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Vary', 'Origin');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }
}
