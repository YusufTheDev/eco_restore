<?php

namespace App\Service;

use App\Entity\Claim;
use Doctrine\ORM\EntityManagerInterface;

class EmissionCalculator
{
    // 1. Inject the EntityManager to allow saving to the database
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    /**
     * The formula: Total CO2 = Σ (Quantity Used * Material CO2 factor)
     */
    public function calculateTotalCarbon(Claim $claim): float
    {
        $total = 0.0;

        foreach ($claim->getClaimItems() as $item) {
            $material = $item->getMaterial();

            if ($material) {
                $total += $item->getQuantityUsed() * $material->getCarbonFootprintPerUnit();
            }
        }

        return $total;
    }

    /**
     * NEW FOR DAY 3: Performs the math AND saves it to the database
     */
    public function calculateAndSave(Claim $claim): float
    {
        // 2. Use your existing math logic
        $total = $this->calculateTotalCarbon($claim);

        // 3. Update the entity with the new score
        $claim->setTotalCarbonScore($total);

        // 4. Tell Doctrine to save this specific claim
        $this->entityManager->persist($claim);
        $this->entityManager->flush();

        return $total;
    }
}