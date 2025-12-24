<?php
namespace App\Service;
//The point of this is to take a claim entity, look at its claim items, find the material for said item, then sum up the carbon emissions for the overall footprint

use App\Entity\Claim;

class EmissionCalculator
{
    /**
     * The formula: Total CO2 = Σ (Quantity Used * Material CO2 factor)
     */
    public function calculateTotalCarbon(Claim $claim): float
    {
        $total = 0.0;

        foreach ($claim->getClaimItems() as $item) {
            $material = $item->getMaterial();
            
            if ($material) {
                // Math: 10sqft * 0.5kg/sqft = 5kg CO2
                $total += $item->getQuantityUsed() * $material->getCarbonFootprintPerUnit();
            }
        }

        return $total;
    }
}