<?php

namespace App\DataFixtures;

use App\Entity\Claim;
use App\Entity\Material;
use App\Entity\ClaimItem;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // 1. Create a Material
        $material = new Material();
        $material->setName('Recycled Steel');
        $material->setCategory('Metal');
        $material->setCarbonFootprintPerUnit(1.5);
        $manager->persist($material);

        // 2. Create a Claim
        $claim = new Claim();
        $claim->setClaimNumber('CLM-1001');
        $claim->setPolicyHolder('Eco Solutions Ltd');
        $manager->persist($claim);

        // 3. Create a ClaimItem to link them
        $item = new ClaimItem();
        $item->setClaim($claim);
        $item->setMaterial($material);
        $item->setQuantityUsed(50.0); // 50 units * 1.5 carbon factor
        $manager->persist($item);

        $manager->flush(); // Save everything to the database
    }
}