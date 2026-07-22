<?php

namespace App\Controller\Admin;

use App\Entity\Page;
use App\Repository\PageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Target;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin/pages')]
class PageCrudController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SluggerInterface $slugger,
        #[Target('app.page_content')]
        private readonly HtmlSanitizerInterface $htmlSanitizer,
    ) {
    }

    /**
     * Liste toutes les pages.
     */
    #[Route('', name: 'admin_pages_list')]
    public function list(PageRepository $pageRepository): Response
    {
        return $this->render('admin/pages_list.html.twig', [
            'pages' => $pageRepository->findAllOrdered(),
        ]);
    }

    /**
     * Créer une nouvelle page.
     */
    #[Route('/new', name: 'admin_page_new')]
    public function new(Request $request): Response
    {
        $page = new Page();

        if ($request->isMethod('POST')) {
            return $this->handleSave($page, $request, true);
        }

        return $this->render('admin/page_editor.html.twig', [
            'page' => $page,
            'is_new' => true,
        ]);
    }

    /**
     * Modifier une page existante.
     */
    #[Route('/{id}/edit', name: 'admin_page_edit', requirements: ['id' => '\d+'])]
    public function edit(Page $page, Request $request): Response
    {
        if ($request->isMethod('POST')) {
            return $this->handleSave($page, $request, false);
        }

        return $this->render('admin/page_editor.html.twig', [
            'page' => $page,
            'is_new' => false,
        ]);
    }

    /**
     * Supprimer une page.
     */
    #[Route('/{id}/delete', name: 'admin_page_delete', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function delete(Page $page, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('delete_page_' . $page->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');

            return $this->redirectToRoute('admin_pages_list');
        }

        if ('accueil' === $page->getSlug()) {
            $this->addFlash('error', 'La page d\'accueil ne peut pas être supprimée.');

            return $this->redirectToRoute('admin_pages_list');
        }

        $this->em->remove($page);
        $this->em->flush();

        $this->addFlash('success', 'Page « ' . $page->getTitle() . ' » supprimée.');

        return $this->redirectToRoute('admin_pages_list');
    }

    /**
     * Traite la sauvegarde (création ou modification).
     */
    private function handleSave(Page $page, Request $request, bool $isNew): Response
    {
        // Protection CSRF (S1)
        if (!$this->isCsrfTokenValid('page_save', $request->request->getString('_token'))) {
            if ($request->isXmlHttpRequest()) {
                return $this->json(['success' => false, 'message' => 'Token CSRF invalide.'], 403);
            }
            $this->addFlash('error', 'Session expirée, veuillez réessayer.');

            return $this->redirectToRoute('admin_pages_list');
        }

        $title = trim($request->request->getString('title', ''));
        $htmlContent = trim($request->request->getString('html_content', ''));
        $grapesjsData = trim($request->request->getString('grapesjs_data', '{}'));
        $status = $request->request->getString('status', 'draft');

        // Validation
        if ('' === $title) {
            $this->addFlash('error', 'Le titre est obligatoire.');

            return $this->render('admin/page_editor.html.twig', [
                'page' => $page,
                'is_new' => $isNew,
            ]);
        }

        if (!in_array($status, ['draft', 'published'], true)) {
            $status = 'draft';
        }

        // Slug : utiliser la valeur fournie ou générer depuis le titre
        $slug = trim($request->request->getString('slug', ''));
        if ('' === $slug) {
            $slug = $this->slugger->slug(strtolower($title))->toString();
        }

        // Nettoyage 1 passe : regex (scripts/on*/iframes).
        // TODO: réactiver sanitizeDocument() après résolution du conflit id/style avec le sanitizer
        $safeHtml = $htmlContent ? $this->cleanHtml($htmlContent) : null;

        $page->setTitle($title);
        $page->setSlug($slug);
        $page->setHtmlContent($safeHtml);
        $page->setGrapesjsData($grapesjsData ?: null);
        $page->setStatus($status);

        $this->em->persist($page);
        $this->em->flush();

        // Si requête AJAX, retourner JSON
        if ($request->isXmlHttpRequest()) {
            return $this->json(['success' => true, 'message' => 'Page sauvegardée.']);
        }

        $action = $isNew ? 'créée' : 'modifiée';
        $this->addFlash('success', 'Page « ' . $page->getTitle() . ' » ' . $action . ' avec succès.');

        return $this->redirectToRoute('admin_pages_list');
    }

    /**
     * Nettoie le HTML en supprimant uniquement les scripts et attributs événementiels.
     * Préserve les formulaires, styles inline, et toutes les balises HTML standards.
     * (Durcissement via symfony/html-sanitizer prévu ultérieurement — cf. sanitizeDocument)
     */
    private function cleanHtml(string $html): string
    {
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/si', '', $html);
        $html = preg_replace('/\s+on\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html);
        $html = preg_replace('/<iframe\b[^>]*>.*?<\/iframe>/si', '', $html);

        // S7 : forcer rel="noopener noreferrer" sur les liens target="_blank"
        $html = preg_replace_callback(
            '/<a\b([^>]*?)target\s*=\s*["\']_blank["\']([^>]*?)>/i',
            function (array $m): string {
                $before = $m[1];
                $after = $m[2];
                // Ne pas dupliquer si déjà présent
                if (!str_contains($before . $after, 'noopener')) {
                    $before = rtrim($before);
                    // Ajouter rel="noopener noreferrer" — si un rel existe déjà, le compléter
                    if (preg_match('/rel\s*=\s*["\']([^"\']*)["\']/i', $before . $after, $relMatch)) {
                        $oldRel = $relMatch[1];
                        $newRel = $oldRel . ' noopener noreferrer';
                        $full = $before . $after;
                        $full = str_replace("rel=\"{$oldRel}\"", "rel=\"{$newRel}\"", $full);
                        $full = str_replace("rel='{$oldRel}'", "rel='{$newRel}'", $full);
                        return '<a' . $full . '>';
                    }
                    return '<a' . $before . ' rel="noopener noreferrer"' . $after . '>';
                }
                return $m[0];
            },
            $html
        );

        return $html;
    }

    /**
     * Sanitize un document HTML complet produit par GrapesJS.
     * - Le CSS du <head> est nettoyé par des règles dédiées (le sanitizer HTML ne gère pas le CSS)
     * - Le contenu du <body> passe par symfony/html-sanitizer (profil app.page_content)
     * - Si le contenu n'est pas un document complet, il est sanitizé directement.
     */
    private function sanitizeDocument(string $html): string
    {
        $trimmed = trim($html);
        $isFullDoc = str_starts_with($trimmed, '<!DOCTYPE') || str_starts_with($trimmed, '<html');

        if (!$isFullDoc) {
            return $this->htmlSanitizer->sanitize($html);
        }

        // Extraire le CSS du <head>
        $css = '';
        if (preg_match_all('/<style[^>]*>(.*?)<\/style>/si', $html, $m)) {
            $css = implode("\n", $m[1]);
        }
        $css = $this->cleanCss($css);

        // Extraire le contenu du <body>
        $body = $html;
        if (preg_match('/<body[^>]*>(.*)<\/body>/si', $html, $m)) {
            $body = $m[1];
        }

        $safeBody = $this->htmlSanitizer->sanitize($body);

        return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' . $css . '</style></head><body>' . $safeBody . '</body></html>';
    }

    /**
     * Nettoie le CSS généré par GrapesJS des vecteurs d'attaque connus.
     */
    private function cleanCss(string $css): string
    {
        // Supprimer les vecteurs dangereux : javascript:, expression(), @import, behavior
        $css = preg_replace('/expression\s*\(/i', 'blocked(', $css);
        $css = preg_replace('/javascript\s*:/i', 'blocked:', $css);
        $css = preg_replace('/@import\b[^;]*;?/i', '', $css);
        $css = preg_replace('/behavior\s*:/i', 'blocked:', $css);
        $css = preg_replace('/-moz-binding\s*:/i', 'blocked:', $css);

        return $css;
    }
}
