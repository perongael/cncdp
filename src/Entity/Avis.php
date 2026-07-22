<?php

namespace App\Entity;

use App\Repository\AvisRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AvisRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Numéro officiel de l'avis (ex: "2024-01", "2024-A-02").
     */
    #[ORM\Column(length: 50, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 50)]
    private ?string $numero = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    private ?string $titre = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')]
    private ?string $slug = null;

    /**
     * Résumé court (affiché sur les cartes de la liste).
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $resume = null;

    /**
     * Contenu complet de l'avis (HTML).
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $contenu = null;

    /**
     * Date de publication de l'avis.
     */
    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Assert\NotBlank]
    private ?\DateTimeInterface $dateAvis = null;

    /**
     * Année extraite de la date (pour filtrage rapide, dénormalisé).
     */
    #[ORM\Column]
    private int $annee = 0;

    /**
     * Nom du fichier PDF stocké dans public/uploads/avis/.
     */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $pdfFilename = null;

    /**
     * Statut : draft (brouillon) ou published (publié).
     */
    #[ORM\Column(length: 20)]
    #[Assert\Choice(['draft', 'published'])]
    private string $status = 'draft';

    /**
     * Critères/valeurs associés à cet avis (filtres dynamiques).
     */
    #[ORM\ManyToMany(targetEntity: CritereValeur::class, inversedBy: 'avis')]
    #[ORM\JoinTable(name: 'avis_critere')]
    private Collection $criteres;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->criteres = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->dateAvis = new \DateTime();
        $this->annee = (int) (new \DateTime())->format('Y');
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumero(): ?string
    {
        return $this->numero;
    }

    public function setNumero(string $numero): static
    {
        $this->numero = $numero;
        return $this;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): static
    {
        $this->titre = $titre;
        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getResume(): ?string
    {
        return $this->resume;
    }

    public function setResume(?string $resume): static
    {
        $this->resume = $resume;
        return $this;
    }

    public function getContenu(): ?string
    {
        return $this->contenu;
    }

    public function setContenu(?string $contenu): static
    {
        $this->contenu = $contenu;
        return $this;
    }

    public function getDateAvis(): ?\DateTimeInterface
    {
        return $this->dateAvis;
    }

    public function setDateAvis(\DateTimeInterface $dateAvis): static
    {
        $this->dateAvis = $dateAvis;
        // Synchroniser l'année automatiquement
        $this->annee = (int) $dateAvis->format('Y');
        return $this;
    }

    public function getAnnee(): int
    {
        return $this->annee;
    }

    public function getPdfFilename(): ?string
    {
        return $this->pdfFilename;
    }

    public function setPdfFilename(?string $pdfFilename): static
    {
        $this->pdfFilename = $pdfFilename;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * @return Collection<int, CritereValeur>
     */
    public function getCriteres(): Collection
    {
        return $this->criteres;
    }

    public function addCritere(CritereValeur $critereValeur): static
    {
        if (!$this->criteres->contains($critereValeur)) {
            $this->criteres->add($critereValeur);
        }
        return $this;
    }

    public function removeCritere(CritereValeur $critereValeur): static
    {
        $this->criteres->removeElement($critereValeur);
        return $this;
    }

    /**
     * Retourne les critères groupés par catégorie.
     * @return array<string, CritereValeur[]>
     */
    public function getCriteresGroupes(): array
    {
        $groupes = [];
        foreach ($this->criteres as $valeur) {
            $critere = $valeur->getCritere();
            $nom = $critere?->getNom() ?? 'Sans catégorie';
            $groupes[$nom][] = $valeur;
        }
        return $groupes;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
