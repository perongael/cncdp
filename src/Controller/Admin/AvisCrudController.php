<?php

namespace App\Controller\Admin;

use App\Entity\Avis;
use App\Entity\CritereValeur;
use App\Repository\AvisRepository;
use App\Repository\CritereRepository;
use App\Repository\CritereValeurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin/avis')]
class AvisCrudController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SluggerInterface $slugger,
    ) {
    }

    private function getPdfDirectory(): string
    {
        $dir = $this->getParameter('kernel.project_dir') . '/public/uploads/avis/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir;
    }

    /**
     * Liste de tous les avis (admin).
     */
    #[Route('', name: 'admin_avis_list')]
    public function list(AvisRepository $avisRepository): Response
    {
        return $this->render('admin/avis_list.html.twig', [
            'avis_list' => $avisRepository->findAllOrdered(),
        ]);
    }

    /**
     * Créer un nouvel avis.
     */
    #[Route('/new', name: 'admin_avis_new')]
    public function new(
        Request $request,
        CritereRepository $critereRepository,
        ValidatorInterface $validator,
    ): Response {
        $avis = new Avis();

        if ($request->isMethod('POST')) {
            return $this->handleSave($avis, $request, $critereRepository, true);
        }

        return $this->render('admin/avis_edit.html.twig', [
            'avis' => $avis,
            'is_new' => true,
            'criteres_disponibles' => $critereRepository->findActifs(),
            'errors' => [],
        ]);
    }

    /**
     * Modifier un avis existant.
     */
    #[Route('/{id}/edit', name: 'admin_avis_edit', requirements: ['id' => '\d+'])]
    public function edit(
        Avis $avis,
        Request $request,
        CritereRepository $critereRepository,
    ): Response {
        if ($request->isMethod('POST')) {
            return $this->handleSave($avis, $request, $critereRepository, false);
        }

        return $this->render('admin/avis_edit.html.twig', [
            'avis' => $avis,
            'is_new' => false,
            'criteres_disponibles' => $critereRepository->findActifs(),
            'errors' => [],
        ]);
    }

    /**
     * Supprimer un avis.
     */
    #[Route('/{id}/delete', name: 'admin_avis_delete', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function delete(Avis $avis, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('delete_avis_' . $avis->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_avis_list');
        }

        // Supprimer le PDF associé
        if ($avis->getPdfFilename()) {
            $pdfPath = $this->getPdfDirectory() . $avis->getPdfFilename();
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
            }
        }

        $this->em->remove($avis);
        $this->em->flush();

        $this->addFlash('success', 'Avis « ' . $avis->getTitre() . ' » supprimé.');

        return $this->redirectToRoute('admin_avis_list');
    }

    /**
     * Publier / Dépublier un avis (toggle).
     */
    #[Route('/{id}/toggle', name: 'admin_avis_toggle', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function toggle(Avis $avis, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('toggle_avis_' . $avis->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_avis_list');
        }

        $avis->setStatus($avis->isPublished() ? 'draft' : 'published');
        $this->em->flush();

        $action = $avis->isPublished() ? 'publié' : 'dépublié';
        $this->addFlash('success', 'Avis « ' . $avis->getTitre() . ' » ' . $action . '.');

        return $this->redirectToRoute('admin_avis_list');
    }

    /**
     * Supprimer le PDF d'un avis.
     */
    #[Route('/{id}/delete-pdf', name: 'admin_avis_delete_pdf', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function deletePdf(Avis $avis, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('delete_pdf_' . $avis->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_avis_edit', ['id' => $avis->getId()]);
        }

        if ($avis->getPdfFilename()) {
            $pdfPath = $this->getPdfDirectory() . $avis->getPdfFilename();
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
            }
            $avis->setPdfFilename(null);
            $this->em->flush();
            $this->addFlash('success', 'PDF supprimé.');
        }

        return $this->redirectToRoute('admin_avis_edit', ['id' => $avis->getId()]);
    }

    /**
     * Logique de sauvegarde partagée (création + modification).
     */
    private function handleSave(
        Avis $avis,
        Request $request,
        CritereRepository $critereRepository,
        bool $isNew,
    ): Response {
        $errors = [];

        // Récupération des champs
        $numero = trim($request->request->get('numero', ''));
        $titre = trim($request->request->get('titre', ''));
        $slug = trim($request->request->get('slug', ''));
        $resume = trim($request->request->get('resume', ''));
        $contenu = trim($request->request->get('contenu', ''));
        $dateAvisStr = trim($request->request->get('date_avis', ''));
        $status = trim($request->request->get('status', 'draft'));

        // Validation basique
        if (empty($numero)) {
            $errors[] = 'Le numéro est obligatoire.';
        }
        if (empty($titre)) {
            $errors[] = 'Le titre est obligatoire.';
        }
        if (empty($slug)) {
            $slug = strtolower($this->slugger->slug($titre)->toString());
        }
        if (empty($dateAvisStr)) {
            $errors[] = 'La date de l\'avis est obligatoire.';
        }

        // Vérification unicité numero / slug
        $existingByNumero = $this->em->getRepository(Avis::class)->findOneBy(['numero' => $numero]);
        if ($existingByNumero && $existingByNumero->getId() !== $avis->getId()) {
            $errors[] = 'Le numéro « ' . $numero . ' » est déjà utilisé.';
        }
        $existingBySlug = $this->em->getRepository(Avis::class)->findOneBy(['slug' => $slug]);
        if ($existingBySlug && $existingBySlug->getId() !== $avis->getId()) {
            $errors[] = 'Le slug « ' . $slug . ' » est déjà utilisé.';
        }

        if (!empty($errors)) {
            return $this->render('admin/avis_edit.html.twig', [
                'avis' => $avis,
                'is_new' => $isNew,
                'criteres_disponibles' => $critereRepository->findActifs(),
                'errors' => $errors,
            ]);
        }

        // Remplissage de l'entité
        $avis->setNumero($numero);
        $avis->setTitre($titre);
        $avis->setSlug($slug);
        $avis->setResume($resume ?: null);
        $avis->setContenu($contenu ?: null);
        $avis->setDateAvis(new \DateTime($dateAvisStr));
        $avis->setStatus($status);

        // Gestion du PDF uploadé
        $uploadedFile = $request->files->get('pdf_file');
        if ($uploadedFile && $uploadedFile->getClientOriginalName()) {
            $allowedMimeTypes = ['application/pdf'];
            if (!in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
                $errors[] = 'Seuls les fichiers PDF sont acceptés.';
                return $this->render('admin/avis_edit.html.twig', [
                    'avis' => $avis,
                    'is_new' => $isNew,
                    'criteres_disponibles' => $critereRepository->findActifs(),
                    'errors' => $errors,
                ]);
            }

            // Créer le dossier si nécessaire
            $pdfDir = $this->getPdfDirectory();

            // Supprimer l'ancien PDF
            if ($avis->getPdfFilename()) {
                $oldPath = $pdfDir . $avis->getPdfFilename();
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            // Nommer le fichier : slug + timestamp
            $safeFilename = $avis->getSlug() . '-' . date('Ymd-His') . '.pdf';
            $uploadedFile->move($pdfDir, $safeFilename);
            $avis->setPdfFilename($safeFilename);
        }

        // Gestion des critères (valeurs sélectionnées)
        $critereValeurIds = $request->request->all('criteres_valeurs') ?: [];
        // Nettoyer les critères existants
        foreach ($avis->getCriteres()->toArray() as $existingCritere) {
            $avis->removeCritere($existingCritere);
        }
        // Ajouter les nouveaux
        if (!empty($critereValeurIds)) {
            $critereValeurRepo = $this->em->getRepository(CritereValeur::class);
            foreach ($critereValeurIds as $cvId) {
                $cv = $critereValeurRepo->find((int) $cvId);
                if ($cv) {
                    $avis->addCritere($cv);
                }
            }
        }

        if ($isNew) {
            $this->em->persist($avis);
        }
        $this->em->flush();

        $this->addFlash('success', $isNew
            ? 'Avis « ' . $avis->getTitre() . ' » créé.'
            : 'Avis « ' . $avis->getTitre() . ' » mis à jour.'
        );

        return $this->redirectToRoute('admin_avis_list');
    }
}
