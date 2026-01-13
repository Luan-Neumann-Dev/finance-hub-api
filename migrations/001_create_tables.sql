-- TABELA DE USUÁRIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE RECEITAS
CREATE TABLE incomes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    recurrence VARCHAR(50) DEFAULT 'monthly',
    receive_date INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

-- TABELA DE CATEGORIAS DE DESPESAS
CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#FF6B35',
    icon VARCHAR(50) DEFAULT 'tag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE DESPESAS
CREATE TABLE expenses(
    id SERIAL PRIMARY KEY, 
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR(255),
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE PORQUINHOS
CREATE TABLE piggy_banks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    bank VARCHAR(100) DEFAULT 'Outro',
    balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE TRANSAÇÕES DOS PORQUINHOS
CREATE TABLE piggy_transactions (
    id SERIAL PRIMARY KEY,
    piggy_bank_id INTEGER REFERENCES piggy_banks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('deposit', 'withdrawal')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA MELHORAR DESEMPENHO
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);
CREATE INDEX idx_piggy_banks_user_id ON piggy_banks(user_id);
CREATE INDEX idx_piggy_transactions_piggy_bank_id ON piggy_transactions(piggy_bank_id);
CREATE INDEX idx_piggy_transactions_user_id ON piggy_transactions(user_id);
CREATE INDEX idx_piggy_transactions_date ON piggy_transactions(date);

-- FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incomes_updated_at
  BEFORE UPDATE ON incomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_piggy_banks_updated_at
  BEFORE UPDATE ON piggy_banks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar saldo do porquinho automaticamente
CREATE OR REPLACE FUNCTION update_piggy_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'deposit' THEN
      UPDATE piggy_banks SET balance = balance + NEW.amount WHERE id = NEW.piggy_bank_id;
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE piggy_banks SET balance = balance - NEW.amount WHERE id = NEW.piggy_bank_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'deposit' THEN
      UPDATE piggy_banks SET balance = balance - OLD.amount WHERE id = OLD.piggy_bank_id;
    ELSIF OLD.type = 'withdrawal' THEN
      UPDATE piggy_banks SET balance = balance + OLD.amount WHERE id = OLD.piggy_bank_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_piggy_balance_on_transaction
  AFTER INSERT OR DELETE ON piggy_transactions
  FOR EACH ROW EXECUTE FUNCTION update_piggy_bank_balance();