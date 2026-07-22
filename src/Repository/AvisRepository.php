<?php

namespace App\Repository;

use App\Entity\Avis;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Avis>
 */
class AvisRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Avis::class);
    }

    /**
     * @return Avis[]
     */
    public function findAllPublished(): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.status = :status')
            ->setParameter('status', 'published')
            ->orderBy('a.dateAvis', 'DESC')
            ->addOrderBy('a.numero', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Retourne les avis publiés avec filtres optionnels.
     *
     * @param array<string, mixed> $filters
     * @return Avis[]
     */
    public function findByFilters(array $filters): array
    {
        $qb = $this->createQueryBuilder('a')
            ->andWhere('a.status = :status')
            ->setParameter('status', 'published');

        // Recherche texte (numéro, titre, résumé)
        if (!empty($filters['q'])) {
            $qb->andWhere(
                $qb->expr()->orX(
                    'a.numero LIKE :q',
                    'a.titre LIKE :q',
                    'a.resume LIKE :q',
                    'a.contenu LIKE :q'
                )
            )->setParameter('q', '%' . $filters['q'] . '%');
        }

        // Filtre par année
        if (!empty($filters['annee'])) {
            $qb->andWhere('a.annee = :annee')
               ->setParameter('annee', (int) $filters['annee']);
        }

        // Filtre par valeurs de critères (ManyToMany)
        if (!empty($filters['criteres']) && is_array($filters['criteres'])) {
            $qb->join('a.criteres', 'cv')
               ->andWhere('cv.id IN (:critereIds)')
               ->setParameter('critereIds', array_map('intval', $filters['criteres']));
        }

        return $qb->orderBy('a.dateAvis', 'DESC')
                  ->addOrderBy('a.numero', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Retourne les années distinctes des avis publiés (pour le filtre).
     * @return int[]
     */
    public function findDistinctAnnees(): array
    {
        $result = $this->createQueryBuilder('a')
            ->select('DISTINCT a.annee')
            ->andWhere('a.status = :status')
            ->setParameter('status', 'published')
            ->orderBy('a.annee', 'DESC')
            ->getQuery()
            ->getResult();

        return array_map(fn($row) => (int) $row['annee'], $result);
    }

    /**
     * Retourne les avis similaires (mêmes critères) sauf l'avis courant.
     * @return Avis[]
     */
    public function findSimilaires(Avis $avis, int $limit = 3): array
    {
        $critereIds = $avis->getCriteres()->map(fn($cv) => $cv->getId())->toArray();

        if (empty($critereIds)) {
            return $this->createQueryBuilder('a')
                ->andWhere('a.id != :id')
                ->andWhere('a.status = :status')
                ->setParameter('id', $avis->getId())
                ->setParameter('status', 'published')
                ->orderBy('a.dateAvis', 'DESC')
                ->setMaxResults($limit)
                ->getQuery()
                ->getResult();
        }

        return $this->createQueryBuilder('a')
            ->join('a.criteres', 'cv')
            ->andWhere('a.id != :id')
            ->andWhere('a.status = :status')
            ->andWhere('cv.id IN (:critereIds)')
            ->setParameter('id', $avis->getId())
            ->setParameter('status', 'published')
            ->setParameter('critereIds', $critereIds)
            ->groupBy('a.id')
            ->orderBy('COUNT(DISTINCT cv.id)', 'DESC')
            ->addOrderBy('a.dateAvis', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Avis[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('a')
            ->orderBy('a.dateAvis', 'DESC')
            ->addOrderBy('a.numero', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countPublished(): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->andWhere('a.status = :status')
            ->setParameter('status', 'published')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
