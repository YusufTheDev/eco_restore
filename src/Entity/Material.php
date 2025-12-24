<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Repository\MaterialRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MaterialRepository::class)]
#[ApiResource(graphQlOperations: [
    new Query(name: 'item_query'),
    new QueryCollection(name: 'collection_query'),
])]
class Material
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $carbonFootprintPerUnit = null;

    #[ORM\Column(length: 100)]
    private ?string $category = null;

    /**
     * @var Collection<int, ClaimItem>
     */
    #[ORM\OneToMany(targetEntity: ClaimItem::class, mappedBy: 'material')]
    private Collection $claimItems;

    public function __construct()
    {
        $this->claimItems = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getCarbonFootprintPerUnit(): ?float
    {
        return $this->carbonFootprintPerUnit;
    }

    public function setCarbonFootprintPerUnit(float $carbonFootprintPerUnit): static
    {
        $this->carbonFootprintPerUnit = $carbonFootprintPerUnit;
        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;
        return $this;
    }

    /**
     * @return Collection<int, ClaimItem>
     */
    public function getClaimItems(): Collection
    {
        return $this->claimItems;
    }

    public function addClaimItem(ClaimItem $claimItem): static
    {
        if (!$this->claimItems->contains($claimItem)) {
            $this->claimItems->add($claimItem);
            $claimItem->setMaterial($this);
        }
        return $this;
    }

    public function removeClaimItem(ClaimItem $claimItem): static
    {
        if ($this->claimItems->removeElement($claimItem)) {
            if ($claimItem->getMaterial() === $this) {
                $claimItem->setMaterial(null);
            }
        }
        return $this;
    }
}