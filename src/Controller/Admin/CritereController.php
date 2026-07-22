<?php

namespace App\Controller\Admin;

use App\Entity\Critere;
use App\Entity\CritereValeur;
use App\Repository\CritereRepository;
use App\Repository\CritereValeurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Gestion des critères de filtres dynamiques (catégories et valeurs).
 * Les administrateurs peuvent créer/modifier/supprimer des critères et leurs valeurs sans toucher au code.
 */
#[IsGranted('ROLE_ADMIN')]
#[Route('/admin/criteres')]
class CritereController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SluggerInterface $slugger,
    ) {
    }

    /**
     * Liste de tous les critères et leurs valeurs (admin).
     */
    #[Route('', name: 'admin_criteres_list')]
    public function list(CritereRepository $critereRepository): Response
    {
        return $this->render('admin/criteres.html.twig', [
            'criteres' => $critereRepository->findAllOrdered(),
        ]);
    }

    /**
     * Créer un nouveau critère.
     */
    #[Route('/new', name: 'admin_critere_new', methods: ['POST'])]
    public function newCritere(Request $request): Response
    {
        if (!$this->isCsrfTokenValid('critere_new', $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $nom = trim(strip_tags($request->request->get('nom', '')));
        if (empty($nom)) {
            $this->addFlash('error', 'Le nom du critère est obligatoire.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $slug = strtolower($this->slugger->slug($nom)->toString());

        $existing = $this->em->getRepository(Critere::class)->findOneBy(['slug' => $slug]);
        if ($existing) {
            $this->addFlash('error', 'Un critère avec ce nom existe déjà.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $critere = new Critere();
        $critere->setNom($nom);
        $critere->setSlug($slug);
        $critere->setOrdre((int) $request->request->get('ordre', 0));

        $this->em->persist($critere);
        $this->em->flush();

        $this->addFlash('success', 'Critère « ' . $nom . ' » créé.');

        return $this->redirectToRoute('admin_criteres_list');
    }

    /**
     * Modifier un critère existant.
     */
    #[Route('/{id}/edit', name: 'admin_critere_edit', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function editCritere(Critere $critere, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('critere_edit_' . $critere->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $nom = trim(strip_tags($request->request->get('nom', '')));
        if (empty($nom)) {
            $this->addFlash('error', 'Le nom est obligatoire.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $critere->setNom($nom);
        $critere->setOrdre((int) $request->request->get('ordre', $critere->getOrdre()));
        $critere->setActif((bool) $request->request->get('actif', true));

        $this->em->flush();

        $this->addFlash('success', 'Critère « ' . $nom . ' » mis à jour.');

        return $this->redirectToRoute('admin_criteres_list');
    }

    /**
     * Supprimer un critère et toutes ses valeurs.
     */
    #[Route('/{id}/delete', name: 'admin_critere_delete', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function deleteCritere(Critere $critere, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('critere_delete_' . $critere->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $nom = $critere->getNom();
        $this->em->remove($critere);
        $this->em->flush();

        $this->addFlash('success', 'Critère « ' . $nom . ' » supprimé.');

        return $this->redirectToRoute('admin_criteres_list');
    }

    /**
     * Ajouter une valeur à un critère.
     */
    #[Route('/{id}/valeur/new', name: 'admin_critere_valeur_new', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function newValeur(Critere $critere, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('valeur_new_' . $critere->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $valeurTexte = trim(strip_tags($request->request->get('valeur', '')));
        if (empty($valeurTexte)) {
            $this->addFlash('error', 'La valeur est obligatoire.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $slug = strtolower($this->slugger->slug($valeurTexte)->toString());

        $valeur = new CritereValeur();
        $valeur->setCritere($critere);
        $valeur->setValeur($valeurTexte);
        $valeur->setSlug($slug);
        $valeur->setOrdre((int) $request->request->get('ordre', 0));

        $this->em->persist($valeur);
        $this->em->flush();

        $this->addFlash('success', 'Valeur « ' . $valeurTexte . ' » ajoutée à « ' . $critere->getNom() . ' ».');

        return $this->redirectToRoute('admin_criteres_list');
    }

    /**
     * Modifier une valeur de critère.
     */
    #[Route('/valeur/{id}/edit', name: 'admin_critere_valeur_edit', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function editValeur(CritereValeur $valeur, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('valeur_edit_' . $valeur->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $valeurTexte = trim(strip_tags($request->request->get('valeur', '')));
        if (empty($valeurTexte)) {
            $this->addFlash('error', 'La valeur est obligatoire.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $valeur->setValeur($valeurTexte);
        $valeur->setOrdre((int) $request->request->get('ordre', $valeur->getOrdre()));
        $valeur->setActif((bool) $request->request->get('actif', true));

        $this->em->flush();

        $this->addFlash('success', 'Valeur « ' . $valeurTexte . ' » mise à jour.');

        return $this->redirectToRoute('admin_criteres_list');
    }

    /**
     * Supprimer une valeur de critère.
     */
    #[Route('/valeur/{id}/delete', name: 'admin_critere_valeur_delete', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function deleteValeur(CritereValeur $valeur, Request $request): Response
    {
        if (!$this->isCsrfTokenValid('valeur_delete_' . $valeur->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_criteres_list');
        }

        $valeurTexte = $valeur->getValeur();
        $critereNom = $valeur->getCritere()?->getNom() ?? '?';
        $this->em->remove($valeur);
        $this->em->flush();

        $this->addFlash('success', 'Valeur « ' . $valeurTexte . ' » supprimée de « ' . $critereNom . ' ».');

        return $this->redirectToRoute('admin_criteres_list');
    }
}
