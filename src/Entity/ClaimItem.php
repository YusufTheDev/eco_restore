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
}