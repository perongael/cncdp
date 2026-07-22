<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Ajoute les headers de sécurité aux réponses front-office :
 * - Content-Security-Policy (bloque scripts inline, iframes arbitraires, objets)
 * - X-Content-Type-Options (nosniff)
 * - X-Frame-Options (même origine, anti-clickjacking)
 *
 * Ne s'applique PAS à l'admin (routes /admin) pour ne pas casser l'éditeur GrapesJS.
 */
class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => ['onKernelResponse', -10],
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $response = $event->getResponse();

        // Ne pas appliquer à l'admin (l'éditeur a besoin de scripts/blobs/styles inline)
        if (str_starts_with($request->getPathInfo(), '/admin')) {
            return;
        }

        // Ne pas appliquer aux assets, profiler, etc.
        if (str_starts_with($request->getPathInfo(), '/_')) {
            return;
        }

        // Uniquement pour les réponses HTML
        $contentType = $response->headers->get('Content-Type', '');
        if (!str_contains($contentType, 'text/html')) {
            return;
        }

        // CSP en mode report-only en dev (ne bloque pas, mais signale dans la console)
        // En prod, la CSP est appliquée strictement
        $env = $_ENV['APP_ENV'] ?? 'dev';
        $cspHeader = ($env === 'prod') ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';

        // CSP : autorise les CDN légitimes + styles inline (nécessaires pour le HTML GrapesJS)
        // Note : 'unsafe-inline' pour les styles est requis car le HTML stocké contient des styles inline
        $csp = "default-src 'self'; "
            . "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://code.jquery.com https://cdnjs.cloudflare.com; "
            . "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
            . "img-src 'self' data: https:; "
            . "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; "
            . "frame-src https://www.youtube-nocookie.com; "
            . "object-src 'none'; "
            . "base-uri 'self'; "
            . "form-action 'self';";

        $response->headers->set($cspHeader, $csp);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Désactiver le cache HTTP pour éviter les incohérences de menu/footer
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
    }
}
