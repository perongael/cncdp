<?php

namespace App\Controller;

use App\Repository\PageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PageController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    #[Route('/accueil', name: 'app_homepage')]
    public function index(PageRepository $pageRepository): Response
    {
        return $this->renderPage('accueil', $pageRepository, 'pages/accueil.html.twig');
    }

    #[Route('/{slug}', name: 'app_page', priority: -10)]
    public function show(string $slug, PageRepository $pageRepository): Response
    {
        return $this->renderPage($slug, $pageRepository);
    }

    private function renderPage(string $slug, PageRepository $pageRepository, string $fallbackTemplate = null): Response
    {
        $page = $pageRepository->findOneBy(['slug' => $slug]);

        if (!$page) {
            if ($fallbackTemplate) {
                return $this->render($fallbackTemplate);
            }
            throw $this->createNotFoundException('Page introuvable');
        }

        $content = $page->getHtmlContent() ?? '';

        // Si le contenu est déjà un document HTML complet (post-édition GrapesJS), extraire le body + styles
        if (str_starts_with(trim($content), '<!DOCTYPE') || str_starts_with(trim($content), '<html')) {
            $headEnd = stripos($content, '</head>');
            $styles = '';
            if ($headEnd !== false) {
                $headContent = substr($content, 0, $headEnd);
                // Extraire toutes les balises <style>...</style>
                if (preg_match_all('/<style[^>]*>(.*?)<\/style>/si', $headContent, $matches)) {
                    $styles = '<style>' . implode("\n", $matches[1]) . '</style>';
                }
            }
            $bodyStart = stripos($content, '<body');
            $bodyEnd = strripos($content, '</body>');
            if ($bodyStart !== false && $bodyEnd !== false) {
                $bodyStart = strpos($content, '>', $bodyStart) + 1;
                $content = $styles . substr($content, $bodyStart, $bodyEnd - $bodyStart);
            }
        }

        return $this->render('pages/dynamic.html.twig', [
            'content' => $content,
            'page' => $page,
        ]);
    }
}
