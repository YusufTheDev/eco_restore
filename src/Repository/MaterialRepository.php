<?php

namespace App\Repository;

use App\Entity\Material;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Material>
 */
class MaterialRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Material::class);
    }

    public function findBetterAlternative(string $category, float $currentFactor, string $unit): ?Material
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.category = :category')
            ->andWhere('m.unit = :unit') // Important: Must match unit (kg vs m3)
            ->andWhere('m.carbonFootprintPerUnit < :currentFactor')
            ->setParameter('category', $category)
            ->setParameter('unit', $unit)
            ->setParameter('currentFactor', $currentFactor)
            ->orderBy('m.carbonFootprintPerUnit', 'ASC') // Find the BEST one
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
