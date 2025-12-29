<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251227233109 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE claim_item ADD transport_distance DOUBLE PRECISION DEFAULT NULL, ADD transport_method VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE material ADD density DOUBLE PRECISION DEFAULT NULL, ADD source_date DATETIME DEFAULT NULL, ADD industry_average_factor DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE claim_item DROP transport_distance, DROP transport_method');
        $this->addSql('ALTER TABLE material DROP density, DROP source_date, DROP industry_average_factor');
    }
}
