-- Database initialization schema for Moon IMS
-- Optimized with Product Variant & Dynamic Attribute System (EAV)

-- ------------------------------------------------------------
-- 1. tb_user
-- Stores user accounts for authentication & RBAC
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_user (
  user_id       SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'worker' CHECK (role IN ('worker', 'admin')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed default admin user (email: admin@moonims.com, password: admin123)
INSERT INTO tb_user (name, email, password, role)
SELECT 'Admin User', 'admin@moonims.com', '$2a$10$4MmqmYaQVbJXx.shmOkn/u1py2thSyhTyeOuf9K7qNRPqgdCvYQhq', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM tb_user WHERE email = 'admin@moonims.com');

-- ------------------------------------------------------------
-- 2. tb_category
-- Product categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_category (
  category_id    SERIAL PRIMARY KEY,
  category_name  VARCHAR(100) NOT NULL UNIQUE,
  description    TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. tb_attribute
-- Defines attribute types (e.g. "Size", "Color", "Volume", "Weight")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_attribute (
  attribute_id   SERIAL PRIMARY KEY,
  attribute_name VARCHAR(50) NOT NULL UNIQUE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. tb_attribute_value
-- Selectable values for attributes (e.g. "S", "M", "L", "Red", "Blue")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_attribute_value (
  value_id       SERIAL PRIMARY KEY,
  attribute_id   INT NOT NULL REFERENCES tb_attribute(attribute_id) ON DELETE CASCADE,
  value          VARCHAR(50) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (attribute_id, value)
);

-- ------------------------------------------------------------
-- 5. tb_category_attribute
-- Attributes inherited by default for all products in a category
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_category_attribute (
  category_id    INT NOT NULL REFERENCES tb_category(category_id) ON DELETE CASCADE,
  attribute_id   INT NOT NULL REFERENCES tb_attribute(attribute_id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, attribute_id)
);

-- ------------------------------------------------------------
-- 6. tb_product
-- Core product catalog headers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_product (
  product_id     SERIAL PRIMARY KEY,
  product_code   VARCHAR(50) NOT NULL UNIQUE,
  product_name   VARCHAR(150) NOT NULL,
  category_id    INT NOT NULL REFERENCES tb_category(category_id) ON DELETE CASCADE,
  department     VARCHAR(100),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  image_url      TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. tb_product_attribute
-- Product-specific attribute overrides/additions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_product_attribute (
  product_id     INT NOT NULL REFERENCES tb_product(product_id) ON DELETE CASCADE,
  attribute_id   INT NOT NULL REFERENCES tb_attribute(attribute_id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, attribute_id)
);

-- ------------------------------------------------------------
-- 8. tb_product_variant
-- Stock Keeping Unit (SKU) level records.
-- Every product has >= 1 variant (even simple non-variant products)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_product_variant (
  variant_id     SERIAL PRIMARY KEY,
  product_id     INT NOT NULL REFERENCES tb_product(product_id) ON DELETE CASCADE,
  sku            VARCHAR(50) UNIQUE,
  stock_qty      INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  unit_price     NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 9. tb_variant_attribute_value
-- Junction mapping variant to attribute value combinations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_variant_attribute_value (
  variant_id     INT NOT NULL REFERENCES tb_product_variant(variant_id) ON DELETE CASCADE,
  value_id       INT NOT NULL REFERENCES tb_attribute_value(value_id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, value_id)
);

-- ------------------------------------------------------------
-- 10. tb_worker
-- Registered workers eligible for equipment loans
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_worker (
  worker_id      SERIAL PRIMARY KEY,
  worker_code    VARCHAR(50) NOT NULL UNIQUE,
  worker_name    VARCHAR(100) NOT NULL,
  position_title VARCHAR(100),
  department     VARCHAR(100),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 11. tb_loan
-- Loan transaction headers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_loan (
  loan_id        SERIAL PRIMARY KEY,
  loan_code      VARCHAR(50) NOT NULL UNIQUE,
  worker_id      INT NOT NULL REFERENCES tb_worker(worker_id) ON DELETE CASCADE,
  loan_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE,
  returned_at    TIMESTAMP,
  loan_status    VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (loan_status IN ('OPEN', 'PARTIAL', 'RETURNED', 'CANCELLED')),
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 12. tb_loan_item
-- Loan line items referencing specific variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_loan_item (
  loan_item_id   SERIAL PRIMARY KEY,
  loan_id        INT NOT NULL REFERENCES tb_loan(loan_id) ON DELETE CASCADE,
  variant_id     INT NOT NULL REFERENCES tb_product_variant(variant_id) ON DELETE CASCADE,
  qty            INT NOT NULL CHECK (qty > 0),
  returned_qty   INT NOT NULL DEFAULT 0 CHECK (returned_qty >= 0),
  item_status    VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (item_status IN ('OPEN', 'PARTIAL', 'RETURNED', 'CANCELLED')),
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 13. tb_sale
-- Sales order headers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_sale (
  sale_id        SERIAL PRIMARY KEY,
  sale_code      VARCHAR(50) NOT NULL UNIQUE,
  sale_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name  VARCHAR(100),
  sale_status    VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (sale_status IN ('DRAFT', 'COMPLETED', 'CANCELLED')),
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 14. tb_sale_item
-- Sales order line items referencing specific variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_sale_item (
  sale_item_id   SERIAL PRIMARY KEY,
  sale_id        INT NOT NULL REFERENCES tb_sale(sale_id) ON DELETE CASCADE,
  variant_id     INT NOT NULL REFERENCES tb_product_variant(variant_id) ON DELETE CASCADE,
  qty            INT NOT NULL CHECK (qty > 0),
  unit_price     NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 15. tb_stock_issue
-- Stock issue headers (internal use, damage, loss, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_stock_issue (
  stock_issue_id SERIAL PRIMARY KEY,
  issue_code     VARCHAR(50) NOT NULL UNIQUE,
  issue_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  issue_type     VARCHAR(20) NOT NULL CHECK (issue_type IN ('INTERNAL_USE', 'DAMAGE', 'LOSS', 'EXPIRED', 'GIVEAWAY', 'OTHER')),
  issue_status   VARCHAR(20) NOT NULL DEFAULT 'POSTED' CHECK (issue_status IN ('POSTED', 'CANCELLED')),
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 16. tb_stock_issue_item
-- Stock issue line items referencing specific variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_stock_issue_item (
  stock_issue_item_id SERIAL PRIMARY KEY,
  stock_issue_id INT NOT NULL REFERENCES tb_stock_issue(stock_issue_id) ON DELETE CASCADE,
  variant_id     INT NOT NULL REFERENCES tb_product_variant(variant_id) ON DELETE CASCADE,
  qty            INT NOT NULL CHECK (qty > 0),
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 17. tb_stock_balance
-- Real-time stock balances per variant
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_stock_balance (
  stock_balance_id SERIAL PRIMARY KEY,
  variant_id     INT NOT NULL UNIQUE REFERENCES tb_product_variant(variant_id) ON DELETE CASCADE,
  on_hand_qty    INT NOT NULL DEFAULT 0 CHECK (on_hand_qty >= 0),
  reserved_qty   INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 18. tb_stock_movement
-- Audit log of stock transactions per variant
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_stock_movement (
  movement_id    SERIAL PRIMARY KEY,
  variant_id     INT NOT NULL REFERENCES tb_product_variant(variant_id) ON DELETE CASCADE,
  movement_type  VARCHAR(30) NOT NULL CHECK (movement_type IN ('OPENING', 'PURCHASE_IN', 'LOAN_OUT', 'LOAN_RETURN', 'SALE_OUT', 'ISSUE_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT')),
  qty            INT NOT NULL CHECK (qty > 0),
  loan_item_id   INT REFERENCES tb_loan_item(loan_item_id) ON DELETE SET NULL,
  sale_item_id   INT REFERENCES tb_sale_item(sale_item_id) ON DELETE SET NULL,
  stock_issue_item_id INT REFERENCES tb_stock_issue_item(stock_issue_item_id) ON DELETE SET NULL,
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 19. tb_purchase_request
-- Purchase request headers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_purchase_request (
  purchase_request_id SERIAL PRIMARY KEY,
  request_no     VARCHAR(50) NOT NULL UNIQUE,
  requested_by   VARCHAR(100) NOT NULL,
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purpose        TEXT,
  request_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (request_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  approved_by    VARCHAR(100),
  approved_at    TIMESTAMP,
  rejected_by    VARCHAR(100),
  rejected_at    TIMESTAMP,
  received_by    VARCHAR(100),
  received_at    TIMESTAMP,
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 20. tb_purchase_request_item
-- Purchase request line items referencing specific variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_purchase_request_item (
  purchase_request_item_id SERIAL PRIMARY KEY,
  purchase_request_id INT NOT NULL REFERENCES tb_purchase_request(purchase_request_id) ON DELETE CASCADE,
  variant_id     INT REFERENCES tb_product_variant(variant_id) ON DELETE SET NULL,
  requested_qty  INT NOT NULL CHECK (requested_qty > 0),
  received_qty   INT NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
  reason         TEXT,
  notes          TEXT,
  custom_item_name TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Helpful Indexes for Frequent Lookups
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_variant_product_id ON tb_product_variant(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_attr_value_variant_id ON tb_variant_attribute_value(variant_id);
CREATE INDEX IF NOT EXISTS idx_attribute_value_attribute_id ON tb_attribute_value(attribute_id);
CREATE INDEX IF NOT EXISTS idx_category_attribute_category_id ON tb_category_attribute(category_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_product_id ON tb_product_attribute(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_balance_variant_id ON tb_stock_balance(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movement_variant_id ON tb_stock_movement(variant_id);
CREATE INDEX IF NOT EXISTS idx_loan_item_variant_id ON tb_loan_item(variant_id);
CREATE INDEX IF NOT EXISTS idx_sale_item_variant_id ON tb_sale_item(variant_id);
