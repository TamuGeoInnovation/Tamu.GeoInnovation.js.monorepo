-- This script creates a tier system with three levels: Tiers, TierCategories, and TierBenefits.
-- Each tier can have multiple categories, and each category can have multiple benefits.

drop table if exists TierBenefits;
drop table if exists TierCategories;
drop table if exists Tiers;

-- =============================================
-- Create Tables for Tier System
-- =============================================

-- 1. Create Tiers table (Parent table)
CREATE TABLE [dbo].[Tiers] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [tierId] VARCHAR(50) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [active] BIT NOT NULL DEFAULT 1,
    [added] DATETIME NULL,
    [updated] DATETIME NULL,
    
    CONSTRAINT [PK_Tiers] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_Tiers_tierId] UNIQUE ([tierId])
);

-- 2. Create TierCategories table (Child of Tiers)
CREATE TABLE [dbo].[TierCategories] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [categoryId] VARCHAR(50) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [order] INT NOT NULL DEFAULT 1,
    [active] BIT NOT NULL DEFAULT 1,
    [added] DATETIME NULL,
    [updated] DATETIME NULL,
    [tierId] INT NULL,
    
    CONSTRAINT [PK_TierCategories] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_TierCategories_categoryId] UNIQUE ([categoryId]),
    CONSTRAINT [FK_TierCategories_Tiers] FOREIGN KEY ([tierId]) 
        REFERENCES [dbo].[Tiers] ([id]) ON DELETE CASCADE
);

-- 3. Create TierBenefits table (Child of TierCategories)
CREATE TABLE [dbo].[TierBenefits] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [benefitId] VARCHAR(50) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [valueType] NVARCHAR(255) NULL,
    [value] NVARCHAR(255) NULL,
    [valueLabel] NVARCHAR(255) NULL,
    [unit] NVARCHAR(255) NULL,
    [showcase] BIT NOT NULL DEFAULT 0,
    [order] INT NOT NULL DEFAULT 1,
    [active] BIT NOT NULL DEFAULT 1,
    [added] DATETIME NULL,
    [updated] DATETIME NULL,
    [categoryId] INT NULL,
    
    CONSTRAINT [PK_TierBenefits] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_TierBenefits_benefitId] UNIQUE ([benefitId]),
    CONSTRAINT [FK_TierBenefits_TierCategories] FOREIGN KEY ([categoryId]) 
        REFERENCES [dbo].[TierCategories] ([id]) ON DELETE CASCADE
);

-- =============================================
-- Create Indexes for Performance
-- =============================================

-- Indexes on Tiers table
CREATE NONCLUSTERED INDEX [IX_Tiers_tierId] ON [dbo].[Tiers] ([tierId]);
CREATE NONCLUSTERED INDEX [IX_Tiers_active] ON [dbo].[Tiers] ([active]);
CREATE NONCLUSTERED INDEX [IX_Tiers_added] ON [dbo].[Tiers] ([added]);

-- Indexes on TierCategories table
CREATE NONCLUSTERED INDEX [IX_TierCategories_tierId] ON [dbo].[TierCategories] ([tierId]);
CREATE NONCLUSTERED INDEX [IX_TierCategories_categoryId] ON [dbo].[TierCategories] ([categoryId]);
CREATE NONCLUSTERED INDEX [IX_TierCategories_active] ON [dbo].[TierCategories] ([active]);
CREATE NONCLUSTERED INDEX [IX_TierCategories_order] ON [dbo].[TierCategories] ([order]);

-- Indexes on TierBenefits table
CREATE NONCLUSTERED INDEX [IX_TierBenefits_categoryId] ON [dbo].[TierBenefits] ([categoryId]);
CREATE NONCLUSTERED INDEX [IX_TierBenefits_benefitId] ON [dbo].[TierBenefits] ([benefitId]);
CREATE NONCLUSTERED INDEX [IX_TierBenefits_active] ON [dbo].[TierBenefits] ([active]);
CREATE NONCLUSTERED INDEX [IX_TierBenefits_showcase] ON [dbo].[TierBenefits] ([showcase]);
CREATE NONCLUSTERED INDEX [IX_TierBenefits_order] ON [dbo].[TierBenefits] ([order]);
CREATE NONCLUSTERED INDEX [IX_TierBenefits_valueType] ON [dbo].[TierBenefits] ([valueType]);
CREATE NONCLUSTERED INDEX [IX_TierBenefits_unit] ON [dbo].[TierBenefits] ([unit]);