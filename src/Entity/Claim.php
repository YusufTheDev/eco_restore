<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GraphQl\Query;
use ApiPlatform\Metadata\GraphQl\QueryCollection;
use App\Repository\ClaimRepository;
use App\State\ClaimStateProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ClaimRepository::class)]
#[ApiResource(
    // MOVE PROVIDER HERE: This makes it the default for all operations
    provider: ClaimStateProvider::class,
    graphQlOperations: [
        new Query(name: 'item_query'),
        new QueryCollection(name: 'collection_query'),
    ]
)]
class Claim
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $claimNumber = null;

    #[ORM\Column(length: 255)]
    private ?string $policyHolder = null;

    #[ORM\Column(nullable: true)]
    private ?float $totalCarbonScore = null;

    /**
     * @var Collection<int, ClaimItem>
     */
    #[ORM\OneToMany(targetEntity: ClaimItem::class, mappedBy: 'claim', orphanRemoval: true)]
    private Collection $claimItems;

    public function __construct()
    {
        $this->claimItems = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getClaimNumber(): ?string
    {
        return $this->claimNumber;
    }

    public function setClaimNumber(string $claimNumber): static
    {
        $this->claimNumber = $claimNumber;
        return $this;
    }

    public function getPolicyHolder(): ?string
    {
        return $this->policyHolder;
    }

    public function setPolicyHolder(string $policyHolder): static
    {
        $this->policyHolder = $policyHolder;
        return $this;
    }

    public function getTotalCarbonScore(): ?float
    {
        return $this->totalCarbonScore;
    }

    public function setTotalCarbonScore(?float $totalCarbonScore): static
    {
        $this->totalCarbonScore = $totalCarbonScore;
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
            $claimItem->setClaim($this);
        }
        return $this;
    }

    public function removeClaimItem(ClaimItem $claimItem): static
    {
        if ($this->claimItems->removeElement($claimItem)) {
            if ($claimItem->getClaim() === $this) {
                $claimItem->setClaim(null);
            }
        }
        return $this;
    }
}