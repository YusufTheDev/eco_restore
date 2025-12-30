<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Repository\ClaimItemRepository;
use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ClaimItemRepository::class)]
#[ApiResource(graphQlOperations: [
    new Query(name: 'item_query'),
    new QueryCollection(name: 'collection_query'),
])]
class ClaimItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    #[Assert\GreaterThan(0)]
    private ?float $quantityUsed = null;

    #[ORM\ManyToOne(inversedBy: 'claimItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Material $material = null;

    #[ORM\ManyToOne(inversedBy: 'claimItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Claim $claim = null;

    #[ORM\Column(nullable: true)]
    private ?float $transportDistance = null; // in km

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $transportMethod = null; // truck, rail, ship

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantityUsed(): ?float
    {
        return $this->quantityUsed;
    }

    public function setQuantityUsed(float $quantityUsed): static
    {
        $this->quantityUsed = $quantityUsed;
        return $this;
    }

    public function getMaterial(): ?Material
    {
        return $this->material;
    }

    public function setMaterial(?Material $material): static
    {
        $this->material = $material;
        return $this;
    }

    public function getClaim(): ?Claim
    {
        return $this->claim;
    }

    public function setClaim(?Claim $claim): static
    {
        $this->claim = $claim;
        return $this;
    }

    public function getTransportDistance(): ?float
    {
        return $this->transportDistance;
    }

    public function setTransportDistance(?float $transportDistance): static
    {
        $this->transportDistance = $transportDistance;
        return $this;
    }

    public function getTransportMethod(): ?string
    {
        return $this->transportMethod;
    }

    public function setTransportMethod(?string $transportMethod): static
    {
        $this->transportMethod = $transportMethod;
        return $this;
    }

    public function getTotalCarbonImpact(): float
    {
        $material = $this->getMaterial();
        if (!$material)
            return 0.0;

        $qty = $this->getQuantityUsed();
        $matImpact = $qty * $material->getCarbonFootprintPerUnit();

        $transImpact = 0.0;
        $dist = $this->getTransportDistance() ?? 0;
        if ($dist > 0) {
            $density = $material->getDensity() ?? 0;
            // Weight in tonnes = (Qty * Density (kg/m3 or similar)) / 1000? 
            // Note: If unit is 'kg', density might not be relevant if we just use weight directly?
            // Current Logic assumes Qty is volume if Density is used? 
            // The logic in ApiController was: $weightTonnes = ($qty * $density) / 1000;
            // Let's replicate strict logic from ApiController to match.
            $weightTonnes = ($qty * $density) / 1000;

            $method = $this->getTransportMethod() ?? 'truck';
            $factor = match ($method) {
                'rail' => 0.0119,
                'ship' => 0.0082,
                default => 0.0739
            };
            $transImpact = $weightTonnes * $dist * $factor;
        }

        return $matImpact + $transImpact;
    }
}