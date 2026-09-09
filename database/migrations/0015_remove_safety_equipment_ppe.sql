-- Custom SQL migration file, put your code below! --
-- "Safety Equipment & PPE" moved from the DIVISIONS page to the Home page as its own
-- "Safety & Responsibility" section (see database/seed-data/divisions.ts and
-- components/features/home/safety-responsibility-section.tsx). Remove the division row;
-- its division_spec_rows and any products cascade-delete via the FK.
DELETE FROM `divisions` WHERE `slug` = 'safety-equipment-ppe';
