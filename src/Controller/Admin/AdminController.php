<?php

namespace App\Controller\Admin;

use App\Repository\PageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin')]
class AdminController extends AbstractController
{
    #[Route('', name: 'admin_dashboard')]
    public function dashboard(): Response
    {
        return $this->render('admin/dashboard.html.twig');
    }

    #[Route('/accueil', name: 'admin_homepage')]
    public function homepage(PageRepository $pageRepository): Response
    {
        $homepage = $pageRepository->findOneBy(['slug' => 'accueil']);
        if ($homepage) {
            return $this->redirectToRoute('admin_page_edit', ['id' => $homepage->getId()]);
        }

        return $this->redirectToRoute('admin_page_new');
    }

    #[Route('/organisations', name: 'admin_organizations')]
    public function organizations(): Response
    {
        return $this->render('admin/organizations.html.twig');
    }

    #[Route('/apparence', name: 'admin_appearance')]
    public function appearance(Request $request): Response
    {
        $configFile = $this->getParameter('kernel.project_dir') . '/config/site.json';
        $site = ['logo' => 'logo_cncdp_transp.png'];

        if (file_exists($configFile)) {
            $site = array_merge($site, json_decode(file_get_contents($configFile), true) ?? []);
        }

        if ($request->isMethod('POST')) {
            $uploadedFile = $request->files->get('logo_file');
            if ($uploadedFile) {
                $allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
                if (in_array($uploadedFile->getMimeType(), $allowedTypes)) {
                    $filename = 'logo_' . uniqid() . '.' . $uploadedFile->guessExtension();
                    $uploadedFile->move($this->getParameter('kernel.project_dir') . '/public/images/', $filename);
                    $site['logo'] = $filename;

                    if (!is_dir(dirname($configFile))) {
                        mkdir(dirname($configFile), 0755, true);
                    }
                    file_put_contents($configFile, json_encode($site, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                    $this->addFlash('success', 'Logo mis à jour.');
                } else {
                    $this->addFlash('error', 'Format de fichier non supporté. Utilisez PNG, JPEG ou SVG.');
                }
            }

            return $this->redirectToRoute('admin_appearance');
        }

        return $this->render('admin/appearance.html.twig', ['site' => $site]);
    }

    #[Route('/bas-de-page', name: 'admin_footer')]
    public function footer(Request $request): Response
    {
        $configFile = $this->getParameter('kernel.project_dir') . '/config/footer.json';
        $footer = ['address' => '', 'email' => '', 'links' => '', 'bottom_text' => ''];

        if (file_exists($configFile)) {
            $footer = array_merge($footer, json_decode(file_get_contents($configFile), true) ?? []);
        }

        if ($request->isMethod('POST')) {
            $footer['address'] = strip_tags($request->request->get('address', ''));
            $footer['email'] = strip_tags($request->request->get('email', ''));
            $footer['links'] = $request->request->get('links', '');
            $footer['bottom_text'] = strip_tags($request->request->get('bottom_text', ''));
            $footer['contact_links'] = $request->request->get('contact_links', '');
            $footer['bottom_links'] = $request->request->get('bottom_links', '');

            if (!is_dir(dirname($configFile))) {
                mkdir(dirname($configFile), 0755, true);
            }
            file_put_contents($configFile, json_encode($footer, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            $this->addFlash('success', 'Bas de page mis à jour.');

            return $this->redirectToRoute('admin_footer');
        }

        return $this->render('admin/footer_edit.html.twig', ['footer' => $footer]);
    }

    #[Route('/menu', name: 'admin_menu')]
    public function menu(Request $request): Response
    {
        $configFile = $this->getParameter('kernel.project_dir') . '/config/menu.json';
        $menu = ['items' => []];

        if (file_exists($configFile)) {
            $menu = json_decode(file_get_contents($configFile), true) ?? ['items' => []];
        }

        if ($request->isMethod('POST')) {
            $jsonData = $request->request->get('menu_data', '');
            $decoded = json_decode($jsonData, true);
            if (is_array($decoded) && isset($decoded['items'])) {
                // Nettoyer les labels (strip_tags) et urls
                $decoded['items'] = $this->sanitizeMenuItems($decoded['items']);
                $menu = $decoded;

                if (!is_dir(dirname($configFile))) {
                    mkdir(dirname($configFile), 0755, true);
                }
                file_put_contents($configFile, json_encode($menu, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

                $this->addFlash('success', 'Menu mis à jour.');
            } else {
                $this->addFlash('error', 'Données de menu invalides.');
            }

            return $this->redirectToRoute('admin_menu');
        }

        return $this->render('admin/menu_edit.html.twig', [
            'menu' => $menu,
            'menuJson' => json_encode($menu, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    private function sanitizeMenuItems(array $items): array
    {
        foreach ($items as &$item) {
            $item['label'] = strip_tags($item['label'] ?? '');
            $item['url'] = strip_tags($item['url'] ?? '#');
            $item['id'] = $item['id'] ?? uniqid('m_');
            if (!empty($item['children'])) {
                $item['children'] = $this->sanitizeMenuItems($item['children']);
            } else {
                $item['children'] = [];
            }
        }
        return $items;
    }
}
