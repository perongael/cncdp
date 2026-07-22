<?php

namespace App\Controller;

use App\Repository\AvisRepository;
use App\Repository\CritereRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

class AvisController extends AbstractController
{
    private function getPdfDirectory(): string
    {
        return $this->getParameter('kernel.project_dir') . '/public/uploads/avis/';
    }

    /**
     * Page publique : liste des avis avec recherche et filtres.
     */
    #[Route('/avis', name: 'app_avis_index', priority: 10)]
    public function index(
        Request $request,
        AvisRepository $avisRepository,
        CritereRepository $critereRepository,
    ): Response {
        // Récupération des filtres depuis la query string
        $filters = [
            'q' => $request->query->get('q', ''),
            'annee' => $request->query->get('annee', ''),
        ];

        // Récupération des critères groupés par slug (format: criteres[thematique][]=1&criteres[type-demandeur][]=2)
        $criteresParGroupe = $request->query->all('criteres');
        $criteresFiltres = [];
        if (is_array($criteresParGroupe)) {
            foreach ($criteresParGroupe as $groupe => $ids) {
                if (is_array($ids)) {
                    $idsFiltres = array_filter($ids, fn($v) => $v !== '' && $v !== null);
                    if (!empty($idsFiltres)) {
                        $criteresFiltres[$groupe] = array_map('intval', $idsFiltres);
                    }
                }
            }
        }
        if (!empty($criteresFiltres)) {
            $filters['criteres'] = $criteresFiltres;
        }

        // Récupération de tous les critères actifs pour l'affichage des filtres
        $criteresActifs = $critereRepository->findActifs();

        // Années disponibles (pour le filtre)
        $annees = $avisRepository->findDistinctAnnees();

        // Avis filtrés
        $avisList = $avisRepository->findByFilters($filters);

        $templateData = [
            'avis_list' => $avisList,
            'criteres' => $criteresActifs,
            'annees' => $annees,
            'filters' => $filters,
        ];

        // Requête AJAX : retourner uniquement la liste
        if ($request->query->get('_partial') || $request->headers->get('X-Requested-With') === 'XMLHttpRequest') {
            return $this->render('avis/_list.html.twig', $templateData);
        }

        return $this->render('avis/index.html.twig', $templateData);
    }

    /**
     * Page publique : fiche détaillée d'un avis.
     */
    #[Route('/avis/{slug}', name: 'app_avis_show', priority: 10)]
    public function show(string $slug, AvisRepository $avisRepository): Response
    {
        $avis = $avisRepository->findOneBy(['slug' => $slug]);

        if (!$avis || !$avis->isPublished()) {
            throw $this->createNotFoundException('Avis introuvable.');
        }

        $avisSimilaires = $avisRepository->findSimilaires($avis);

        return $this->render('avis/show.html.twig', [
            'avis' => $avis,
            'avis_similaires' => $avisSimilaires,
        ]);
    }

    /**
     * Téléchargement du PDF d'un avis.
     */
    #[Route('/avis/{slug}/pdf', name: 'app_avis_pdf', priority: 10)]
    public function downloadPdf(string $slug, AvisRepository $avisRepository): Response
    {
        $avis = $avisRepository->findOneBy(['slug' => $slug]);

        if (!$avis || !$avis->isPublished() || !$avis->getPdfFilename()) {
            throw $this->createNotFoundException('PDF introuvable.');
        }

        $pdfPath = $this->getPdfDirectory() . $avis->getPdfFilename();

        if (!file_exists($pdfPath)) {
            throw $this->createNotFoundException('Fichier PDF introuvable sur le serveur.');
        }

        $response = new BinaryFileResponse($pdfPath);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_INLINE,
            $avis->getNumero() . ' - ' . $avis->getTitre() . '.pdf'
        );

        return $response;
    }
}
