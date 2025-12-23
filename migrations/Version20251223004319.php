<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251223004319 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE claim (id INT AUTO_INCREMENT NOT NULL, claim_number VARCHAR(100) NOT NULL, policy_holder VARCHAR(255) NOT NULL, total_carbon_score DOUBLE PRECISION DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE claim_item (id INT AUTO_INCREMENT NOT NULL, quantity_used DOUBLE PRECISION NOT NULL, material_id INT NOT NULL, claim_id INT NOT NULL, INDEX IDX_5114B23AE308AC6F (material_id), INDEX IDX_5114B23A7096A49F (claim_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE claim_item ADD CONSTRAINT FK_5114B23AE308AC6F FOREIGN KEY (material_id) REFERENCES material (id)');
        $this->addSql('ALTER TABLE claim_item ADD CONSTRAINT FK_5114B23A7096A49F FOREIGN KEY (claim_id) REFERENCES claim (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE claim_item DROP FOREIGN KEY FK_5114B23AE308AC6F');
        $this->addSql('ALTER TABLE claim_item DROP FOREIGN KEY FK_5114B23A7096A49F');
        $this->addSql('DROP TABLE claim');
        $this->addSql('DROP TABLE claim_item');
    }
}
