-- Add tb_brand table
CREATE TABLE IF NOT EXISTS tb_brand (
  brand_id       SERIAL PRIMARY KEY,
  brand_name     VARCHAR(100) NOT NULL UNIQUE,
  description    TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add brand_id to tb_product
ALTER TABLE tb_product ADD COLUMN brand_id INT REFERENCES tb_brand(brand_id) ON DELETE RESTRICT;

-- Create index for brand_id in tb_product
CREATE INDEX IF NOT EXISTS idx_product_brand_id ON tb_product(brand_id);
