<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251231000005 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add transport columns to claim_item table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE claim_item ADD COLUMN IF NOT EXISTS transport_distance DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE claim_item ADD COLUMN IF NOT EXISTS transport_method VARCHAR(20) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE claim_item DROP COLUMN transport_distance');
        $this->addSql('ALTER TABLE claim_item DROP COLUMN transport_method');
    }
}
