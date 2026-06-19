-- Database initialization schema for Moon IMS

-- 1. Create users table for authentication
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'worker' CHECK (role IN ('worker', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default admin user (email: admin@moonims.com, password: admin123)
INSERT INTO public.users (name, email, password, role)
SELECT 'Admin User', 'admin@moonims.com', '$2a$10$4MmqmYaQVbJXx.shmOkn/u1py2thSyhTyeOuf9K7qNRPqgdCvYQhq', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@moonims.com');

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  category_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_name character varying NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (category_id)
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  product_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_code character varying NOT NULL UNIQUE,
  product_name character varying NOT NULL,
  category_id bigint NOT NULL,
  department character varying,
  unit_price numeric NOT NULL DEFAULT 0 CHECK (unit_price >= 0::numeric),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  image_url text,
  CONSTRAINT products_pkey PRIMARY KEY (product_id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id)
);

-- 4. Create workers table
CREATE TABLE IF NOT EXISTS public.workers (
  worker_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  worker_code character varying NOT NULL UNIQUE,
  worker_name character varying NOT NULL,
  position_title character varying,
  department character varying,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workers_pkey PRIMARY KEY (worker_id)
);

-- 5. Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  loan_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  loan_code character varying NOT NULL UNIQUE,
  worker_id bigint NOT NULL,
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  returned_at timestamp with time zone,
  loan_status character varying NOT NULL DEFAULT 'OPEN'::character varying CHECK (loan_status::text = ANY (ARRAY['OPEN'::character varying, 'PARTIAL'::character varying, 'RETURNED'::character varying, 'CANCELLED'::character varying]::text[])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT loans_pkey PRIMARY KEY (loan_id),
  CONSTRAINT loans_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(worker_id)
);

-- 6. Create loan_items table
CREATE TABLE IF NOT EXISTS public.loan_items (
  loan_item_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  loan_id bigint NOT NULL,
  product_id bigint NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  returned_qty integer NOT NULL DEFAULT 0,
  item_status character varying NOT NULL DEFAULT 'OPEN'::character varying CHECK (item_status::text = ANY (ARRAY['OPEN'::character varying, 'PARTIAL'::character varying, 'RETURNED'::character varying, 'CANCELLED'::character varying]::text[])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT loan_items_pkey PRIMARY KEY (loan_item_id),
  CONSTRAINT loan_items_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(loan_id),
  CONSTRAINT loan_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);

-- 7. Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  sale_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  sale_code character varying NOT NULL UNIQUE,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name character varying,
  sale_status character varying NOT NULL DEFAULT 'COMPLETED'::character varying CHECK (sale_status::text = ANY (ARRAY['DRAFT'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying]::text[])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sales_pkey PRIMARY KEY (sale_id)
);

-- 8. Create sale_items table
CREATE TABLE IF NOT EXISTS public.sale_items (
  sale_item_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  sale_id bigint NOT NULL,
  product_id bigint NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sale_items_pkey PRIMARY KEY (sale_item_id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(sale_id),
  CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);

-- 9. Create stock_issues table
CREATE TABLE IF NOT EXISTS public.stock_issues (
  stock_issue_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  issue_code character varying NOT NULL UNIQUE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  issue_type character varying NOT NULL CHECK (issue_type::text = ANY (ARRAY['INTERNAL_USE'::character varying, 'DAMAGE'::character varying, 'LOSS'::character varying, 'EXPIRED'::character varying, 'GIVEAWAY'::character varying, 'OTHER'::character varying]::text[])),
  issue_status character varying NOT NULL DEFAULT 'POSTED'::character varying CHECK (issue_status::text = ANY (ARRAY['POSTED'::character varying, 'CANCELLED'::character varying]::text[])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_issues_pkey PRIMARY KEY (stock_issue_id)
);

-- 10. Create stock_issue_items table
CREATE TABLE IF NOT EXISTS public.stock_issue_items (
  stock_issue_item_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  stock_issue_id bigint NOT NULL,
  product_id bigint NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_issue_items_pkey PRIMARY KEY (stock_issue_item_id),
  CONSTRAINT stock_issue_items_stock_issue_id_fkey FOREIGN KEY (stock_issue_id) REFERENCES public.stock_issues(stock_issue_id),
  CONSTRAINT stock_issue_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);

-- 11. Create stock_balances table
CREATE TABLE IF NOT EXISTS public.stock_balances (
  stock_balance_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id bigint NOT NULL UNIQUE,
  on_hand_qty integer NOT NULL DEFAULT 0 CHECK (on_hand_qty >= 0),
  reserved_qty integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_balances_pkey PRIMARY KEY (stock_balance_id),
  CONSTRAINT stock_balances_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);

-- 12. Create stock_movements table
CREATE TABLE IF NOT EXISTS public.stock_movements (
  movement_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id bigint NOT NULL,
  movement_type character varying NOT NULL CHECK (movement_type::text = ANY (ARRAY['OPENING'::character varying, 'PURCHASE_IN'::character varying, 'LOAN_OUT'::character varying, 'LOAN_RETURN'::character varying, 'SALE_OUT'::character varying, 'ISSUE_OUT'::character varying, 'ADJUSTMENT_IN'::character varying, 'ADJUSTMENT_OUT'::character varying]::text[])),
  qty integer NOT NULL CHECK (qty > 0),
  loan_item_id bigint,
  sale_item_id bigint,
  stock_issue_item_id bigint,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_pkey PRIMARY KEY (movement_id),
  CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT stock_movements_loan_item_id_fkey FOREIGN KEY (loan_item_id) REFERENCES public.loan_items(loan_item_id),
  CONSTRAINT stock_movements_sale_item_id_fkey FOREIGN KEY (sale_item_id) REFERENCES public.sale_items(sale_item_id),
  CONSTRAINT stock_movements_stock_issue_item_id_fkey FOREIGN KEY (stock_issue_item_id) REFERENCES public.stock_issue_items(stock_issue_item_id)
);

-- 13. Create purchase_requests table
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  purchase_request_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_no character varying NOT NULL UNIQUE,
  requested_by character varying NOT NULL,
  requested_date date NOT NULL DEFAULT CURRENT_DATE,
  purpose text,
  request_status character varying NOT NULL DEFAULT 'PENDING'::character varying CHECK (request_status::text = ANY (ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying]::text[])),
  approved_by character varying,
  approved_at timestamp with time zone,
  rejected_by character varying,
  rejected_at timestamp with time zone,
  received_by character varying,
  received_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT purchase_requests_pkey PRIMARY KEY (purchase_request_id)
);

-- 14. Create purchase_request_items table
CREATE TABLE IF NOT EXISTS public.purchase_request_items (
  purchase_request_item_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  purchase_request_id bigint NOT NULL,
  product_id bigint,
  requested_qty integer NOT NULL CHECK (requested_qty > 0),
  received_qty integer NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
  reason text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  custom_item_name text,
  CONSTRAINT purchase_request_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);

-- Removed seed data as per user request.
