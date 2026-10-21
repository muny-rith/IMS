-- Migration: Add session and auth audit log tables
CREATE TABLE IF NOT EXISTS tb_user_session (
  session_id     SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES tb_user(user_id) ON DELETE CASCADE,
  token_hash     VARCHAR(64) NOT NULL,
  ip_address     VARCHAR(45),
  user_agent     TEXT,
  device_info    VARCHAR(100),
  is_revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at     TIMESTAMP NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON tb_user_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_token_hash ON tb_user_session(token_hash);

CREATE TABLE IF NOT EXISTS tb_auth_audit_log (
  log_id         SERIAL PRIMARY KEY,
  user_id        INT REFERENCES tb_user(user_id) ON DELETE SET NULL,
  action         VARCHAR(50) NOT NULL,
  ip_address     VARCHAR(45),
  user_agent     TEXT,
  details        JSONB,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON tb_auth_audit_log(user_id);
