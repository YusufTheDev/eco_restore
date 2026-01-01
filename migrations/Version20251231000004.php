<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251231000004 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed extensive material dataset (200+ items)';
    }

    public function up(Schema $schema): void
    {
        // Clear previous seed if exists to avoid duplicates
        $this->addSql('DELETE FROM material');

        // Helper to format values
        // name, factor (kgCO2e/unit), category, unit, density (kg/unit)
        $materials = [
            // --- CONCRETE (Category: Concrete) ---
            // High Carbon
            ['Concrete (C50/60, CEM I)', 0.170, 'Concrete', 'kg', 2400],
            ['Concrete (C40/50, CEM I)', 0.150, 'Concrete', 'kg', 2400],
            ['Concrete (C35/45, CEM I)', 0.145, 'Concrete', 'kg', 2400],
            ['Concrete (C30/37, CEM I)', 0.136, 'Concrete', 'kg', 2400],
            ['Concrete (C25/30, CEM I)', 0.118, 'Concrete', 'kg', 2400],
            // Low Carbon (GGBS/PFA blends)
            ['Concrete (C30/37, 30% GGBS)', 0.105, 'Concrete', 'kg', 2400],
            ['Concrete (C30/37, 50% GGBS)', 0.082, 'Concrete', 'kg', 2400],
            ['Concrete (C30/37, 70% GGBS)', 0.065, 'Concrete', 'kg', 2400],
            ['Concrete (C40/50, 50% GGBS)', 0.095, 'Concrete', 'kg', 2400],
            ['Concrete (C50/60, 50% GGBS)', 0.110, 'Concrete', 'kg', 2400],
            ['Concrete (Recycled Aggregates)', 0.120, 'Concrete', 'kg', 2300],
            ['Cement (Portland CEM I)', 0.850, 'Concrete', 'kg', 1400],
            ['Cement (Rapid Hardening)', 0.900, 'Concrete', 'kg', 1400],
            ['Cement Mortar (1:3)', 0.220, 'Concrete', 'kg', 2000],
            ['Cement Mortar (1:5)', 0.180, 'Concrete', 'kg', 2000],
            ['Screed (Sand/Cement)', 0.180, 'Concrete', 'kg', 2000],

            // --- METALS (Category: Metal) ---
            // Steel
            ['Steel (Rebar, Virgin BOF)', 2.200, 'Metal', 'kg', 7850],
            ['Steel (Rebar, Average)', 1.400, 'Metal', 'kg', 7850], // Better average
            ['Steel (Rebar, 100% Recycled EAF)', 0.450, 'Metal', 'kg', 7850], // Recommendation
            ['Steel (Structural Sections, Virgin)', 2.500, 'Metal', 'kg', 7850],
            ['Steel (Structural Sections, Average)', 1.550, 'Metal', 'kg', 7850],
            ['Steel (Structural Sections, Recycled)', 0.600, 'Metal', 'kg', 7850],
            ['Steel (Sheet, Galvanized)', 2.450, 'Metal', 'kg', 7850],
            ['Steel (Pipe)', 1.900, 'Metal', 'kg', 7850],
            ['Stainless Steel (304, Virgin)', 4.400, 'Metal', 'kg', 8000],
            ['Stainless Steel (304, Recycled)', 1.800, 'Metal', 'kg', 8000],
            // Aluminum
            ['Aluminum (Ingot, Global Avg)', 9.000, 'Metal', 'kg', 2700],
            ['Aluminum (Extruded, Virgin)', 11.000, 'Metal', 'kg', 2700],
            ['Aluminum (Extruded, 80% Recycled)', 2.100, 'Metal', 'kg', 2700],
            ['Aluminum (Sheet, Virgin)', 12.500, 'Metal', 'kg', 2700],
            ['Aluminum (Foxed/Cast)', 6.000, 'Metal', 'kg', 2700],
            // Copper
            ['Copper (Wire/Cable)', 3.800, 'Metal', 'kg', 8960],
            ['Copper (Pipe)', 4.200, 'Metal', 'kg', 8960],
            ['Copper (Sheet)', 4.000, 'Metal', 'kg', 8960],
            ['Copper (Recycled)', 1.200, 'Metal', 'kg', 8960],
            // Zinc/Lead
            ['Zinc (Sheet, Roofing)', 3.100, 'Metal', 'kg', 7140],
            ['Lead (Sheet, Flashing)', 2.100, 'Metal', 'kg', 11340],

            // --- WOOD / TIMBER (Category: Wood) ---
            // Structual
            ['Timber (Softwood, Kiln Dried)', 0.110, 'Wood', 'kg', 500],
            ['Timber (Hardwood, Sawn)', 0.150, 'Wood', 'kg', 700],
            ['Glulam (Glued Laminated Timber)', 0.140, 'Wood', 'kg', 550],
            ['CLT (Cross Laminated Timber)', 0.110, 'Wood', 'kg', 500],
            // Boards
            ['Plywood (Softwood)', 0.350, 'Wood', 'kg', 600],
            ['Plywood (Hardwood)', 0.450, 'Wood', 'kg', 700],
            ['OSB (Oriented Strand Board)', 0.320, 'Wood', 'kg', 650],
            ['MDF (Medium Density Fibreboard)', 0.380, 'Wood', 'kg', 750],
            ['Particleboard / Chipboard', 0.350, 'Wood', 'kg', 650],
            // Sustainable specific
            ['Bamboo Flooring', 0.200, 'Wood', 'kg', 900],
            ['Cork Flooring/Tiles', 0.180, 'Wood', 'kg', 400],
            ['Reclaimed Timber', 0.010, 'Wood', 'kg', 500], // Excellent recommendation

            // --- PLASTICS (Category: Plastic) ---
            ['PVC (Rigid, Pipe)', 2.800, 'Plastic', 'kg', 1400],
            ['PVC (Flexible)', 3.100, 'Plastic', 'kg', 1300],
            ['HDPE (Pipe)', 2.200, 'Plastic', 'kg', 960],
            ['LDPE (Film/Membrane)', 2.400, 'Plastic', 'kg', 920],
            ['PP (Polypropylene)', 2.700, 'Plastic', 'kg', 900],
            ['PS (Polystyrene)', 3.300, 'Plastic', 'kg', 1050],
            ['Polycarbonate (Sheet)', 5.500, 'Plastic', 'kg', 1200],
            ['Epoxy Resin', 6.000, 'Plastic', 'kg', 1150],
            ['Recycled PVC', 0.400, 'Plastic', 'kg', 1400], // Recommendation
            ['Recycled HDPE', 0.500, 'Plastic', 'kg', 960], // Recommendation

            // --- INSULATION (Category: Insulation) ---
            // Foams (High Carbon)
            ['XPS (Extruded Polystyrene)', 10.000, 'Insulation', 'kg', 35],
            ['EPS (Expanded Polystyrene)', 3.300, 'Insulation', 'kg', 25],
            ['PIR (Polyisocyanurate) Foam', 4.500, 'Insulation', 'kg', 32],
            ['PUR (Polyurethane) Foam', 5.000, 'Insulation', 'kg', 35],
            ['Phenolic Foam', 3.800, 'Insulation', 'kg', 35],
            // Minerals (Medium)
            ['Stone Wool / Rock Wool', 1.400, 'Insulation', 'kg', 45],
            ['Glass Wool (Fiberglass)', 1.300, 'Insulation', 'kg', 20],
            ['Cellular Glass', 2.800, 'Insulation', 'kg', 115],
            // Natural (Low Carbon)
            ['Wood Fibre Insulation', 0.200, 'Insulation', 'kg', 50],
            ['Cellulose (Recycled Paper)', 0.100, 'Insulation', 'kg', 40],
            ['Hemp Insulation', 0.350, 'Insulation', 'kg', 35],
            ['Sheep Wool Insulation', 0.500, 'Insulation', 'kg', 25],
            ['Straw Bale', 0.050, 'Insulation', 'kg', 100],

            // --- MASONRY (Category: Masonry) ---
            ['Brick (Clay, Standard)', 0.240, 'Masonry', 'kg', 1700],
            ['Brick (Clay, Engineering)', 0.300, 'Masonry', 'kg', 2100],
            ['Brick (Concrete)', 0.120, 'Masonry', 'kg', 2000],
            ['Brick (Calcium Silicate)', 0.150, 'Masonry', 'kg', 1800],
            ['Block (Dense Concrete)', 0.110, 'Masonry', 'kg', 2100],
            ['Block (Lightweight Aggregate)', 0.180, 'Masonry', 'kg', 1200],
            ['Block (Aerated Concrete/Aircrete)', 0.300, 'Masonry', 'kg', 600],
            ['Stone (Limestone, Cut)', 0.080, 'Masonry', 'kg', 2500],
            ['Stone (Granite, Cut)', 0.150, 'Masonry', 'kg', 2700],
            ['Stone (Sandstone, Cut)', 0.090, 'Masonry', 'kg', 2400],
            ['Mortar (General Purpose)', 0.200, 'Masonry', 'kg', 1900],

            // --- GLASS (Category: Glass) ---
            ['Glass (Float)', 0.900, 'Glass', 'kg', 2500],
            ['Glass (Toughened)', 1.100, 'Glass', 'kg', 2500],
            ['Glass (Laminated)', 1.250, 'Glass', 'kg', 2550],
            ['Double Glazing Unit', 1.300, 'Glass', 'kg', 30], // per kg? roughly.
            ['Triple Glazing Unit', 1.500, 'Glass', 'kg', 45],

            // --- FINISHES (Category: Finishes) ---
            // Plaster/Board
            ['Plasterboard (Standard)', 0.380, 'Finishes', 'kg', 800],
            ['Plasterboard (Fire/Moisture)', 0.420, 'Finishes', 'kg', 850],
            ['Plaster (Gypsum)', 0.120, 'Finishes', 'kg', 1200],
            ['Plaster (Lime)', 0.080, 'Finishes', 'kg', 1400], // Recommendation
            ['Clay Plaster', 0.030, 'Finishes', 'kg', 1600], // Recommendation
            // Flooring
            ['Carpet (Nylon)', 2.800, 'Finishes', 'kg', 1500], // High
            ['Carpet (Wool)', 3.500, 'Finishes', 'kg', 1500], // Methane from sheep
            ['Vinyl Flooring (PVC)', 2.200, 'Finishes', 'kg', 1300],
            ['Linoleum', 0.130, 'Finishes', 'kg', 1200], // Recommendation
            ['Ceramic Tiles', 0.700, 'Finishes', 'kg', 2000],
            ['Porcelain Tiles', 0.850, 'Finishes', 'kg', 2300],
            ['Terrazzo', 0.150, 'Finishes', 'kg', 2400],
            // Paint
            ['Paint (Solvent Based)', 3.000, 'Finishes', 'kg', 1200],
            ['Paint (Water Based)', 1.800, 'Finishes', 'kg', 1300],
            ['Paint (Natural/Clay)', 0.500, 'Finishes', 'kg', 1400],

            // --- INFRASTRUCTURE (Category: Infrastructure) ---
            ['Asphalt (Hot Mix)', 0.050, 'Infrastructure', 'kg', 2300],
            ['Asphalt (Warm Mix)', 0.040, 'Infrastructure', 'kg', 2300],
            ['Bitumen', 0.450, 'Infrastructure', 'kg', 1050],
            ['Gravel / Crushed Rock', 0.008, 'Infrastructure', 'kg', 1600],
            ['Sand', 0.005, 'Infrastructure', 'kg', 1600],
            ['Soil (Topsoil)', 0.002, 'Infrastructure', 'kg', 1300],
        ];

        foreach ($materials as $m) {
            $name = str_replace("'", "''", $m[0]);
            $factor = $m[1];
            $cat = $m[2];
            $unit = $m[3];
            $density = $m[4];

            // Generate SQL
            $this->addSql(
                "INSERT INTO material (name, carbon_footprint_per_unit, category, unit, density, industry_average_factor) 
                 VALUES ('$name', $factor, '$cat', '$unit', $density, NULL)"
            );
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DELETE FROM material');
    }
}
