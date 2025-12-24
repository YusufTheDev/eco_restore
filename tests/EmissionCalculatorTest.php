<?php

namespace App\Tests;
use App\Entity\Claim;
use App\Entity\ClaimItem;
use App\Entity\Material;
use App\Service\EmissionCalculator;
use PHPUnit\Framework\TestCase;

class EmissionCalculatorTest extends TestCase
{
    public function testCalculationIsCorrect(): void
    {
        // 1. Setup fake data
        $calculator = new EmissionCalculator();
        $claim = new Claim();

        // Fake Material (e.g., Concrete with 1.5kg CO2 per unit)
        $material = new Material();
        $material->setCarbonFootprintPerUnit(1.5);

        // Fake Claim Item (e.g., 10 units used)
        $item = new ClaimItem();
        $item->setQuantityUsed(10);
        $item->setMaterial($material);

        // Add item to claim
        $claim->addClaimItem($item);

        // 2. Execute the math (10 * 1.5 should be 15)
        $result = $calculator->calculateTotalCarbon($claim);

        // 3. Assert (Prove) it equals 15
        $this->assertEquals(15.0, $result);
    }
}
