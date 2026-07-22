<?php

namespace App\Entity;

use App\Repository\CritereRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Catégorie de filtre dynamique (ex: "Thématique", "Type de demandeur", "Contexte", "Mot-clé"…).
 * Les administrateurs peuvent créer/modifier/supprimer ces critères sans toucher au code.
 */
#[ORM\Entity(repositoryClass: CritereRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Critere
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    private ?string $nom = null;

    #[ORM\Column(length: 100, unique: true)]
    #[Assert\NotBlank]
    private ?string $slug = null;

    /**
     * Indique si ce critère est actif et apparaît dans les filtres publics.
     */
    #[ORM\Column]
    private bool $actif = true;

    /**
     * Ordre d'affichage dans les filtres et le formulaire admin.
     */
    #[ORM\Column]
    private int $ordre = 0;

    /**
     * Valeurs associées à ce critère.
     * @var Collection<int, CritereValeur>
     */
    #[ORM\OneToMany(mappedBy: 'critere', targetEntity: CritereValeur::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['ordre' => 'ASC', 'valeur' => 'ASC'])]
    private Collection $valeurs;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->valeurs = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
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

    public function isActif(): bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;
        return $this;
    }

    public function getOrdre(): int
    {
        return $this->ordre;
    }

    public function setOrdre(int $ordre): static
    {
        $this->ordre = $ordre;
        return $this;
    }

    /**
     * @return Collection<int, CritereValeur>
     */
    public function getValeurs(): Collection
    {
        return $this->valeurs;
    }

    /**
     * Retourne uniquement les valeurs actives.
     * @return CritereValeur[]
     */
    public function getValeursActives(): array
    {
        return $this->valeurs->filter(fn(CritereValeur $v) => $v->isActif())->toArray();
    }

    public function addValeur(CritereValeur $valeur): static
    {
        if (!$this->valeurs->contains($valeur)) {
            $this->valeurs->add($valeur);
            $valeur->setCritere($this);
        }
        return $this;
    }

    public function removeValeur(CritereValeur $valeur): static
    {
        if ($this->valeurs->removeElement($valeur)) {
            if ($valeur->getCritere() === $this) {
                $valeur->setCritere(null);
            }
        }
        return $this;
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
