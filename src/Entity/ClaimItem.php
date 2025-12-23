<?php

namespace App\Entity;

use App\Repository\ClaimItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ClaimItemRepository::class)]
class ClaimItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $quantityUsed = null;

    #[ORM\ManyToOne(inversedBy: 'claimItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Material $material = null;

    #[ORM\ManyToOne(inversedBy: 'claimItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Claim $claim = null;

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
}
