<?php

namespace App\Repository;

use App\Entity\CritereValeur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CritereValeur>
 */
class CritereValeurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CritereValeur::class);
    }

    /**
     * Retourne les valeurs d'un critère, pour les filtres publics.
     * @return CritereValeur[]
     */
    public function findByCritereActives(int $critereId): array
    {
        return $this->createQueryBuilder('cv')
            ->andWhere('cv.critere = :critereId')
            ->andWhere('cv.actif = :actif')
            ->setParameter('critereId', $critereId)
            ->setParameter('actif', true)
            ->orderBy('cv.ordre', 'ASC')
            ->addOrderBy('cv.valeur', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Retourne toutes les valeurs d'un critère (admin).
     * @return CritereValeur[]
     */
    public function findByCritere(int $critereId): array
    {
        return $this->createQueryBuilder('cv')
            ->andWhere('cv.critere = :critereId')
            ->setParameter('critereId', $critereId)
            ->orderBy('cv.ordre', 'ASC')
            ->addOrderBy('cv.valeur', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
