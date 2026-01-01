<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251231000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add project_id to claim table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE claim ADD project_id INT DEFAULT NULL');
        // Add foreign key constraint
        $this->addSql('ALTER TABLE claim ADD CONSTRAINT FK_A290B387166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        // Add index for performance
        $this->addSql('CREATE INDEX IDX_A290B387166D1F9C ON claim (project_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE claim DROP CONSTRAINT FK_A290B387166D1F9C');
        $this->addSql('DROP INDEX IDX_A290B387166D1F9C');
        $this->addSql('ALTER TABLE claim DROP project_id');
    }
}
