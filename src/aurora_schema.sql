-- Users and identity

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE personas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100),
  mode VARCHAR(50),
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  story TEXT,
  values TEXT,
  tone TEXT,
  archetype VARCHAR(100),
  vocabulary JSONB,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services and integrations

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  description TEXT,
  homepage_url TEXT,
  embed_type VARCHAR(50),
  metadata JSONB
);

CREATE TABLE service_integrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  auth_data JSONB,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Surfaces, blocks, components

CREATE TABLE surfaces (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER REFERENCES users(id),
  brand_id INTEGER REFERENCES brands(id),
  title VARCHAR(255),
  type VARCHAR(100),
  status VARCHAR(50),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  surface_id INTEGER REFERENCES surfaces(id),
  kind VARCHAR(100),
  position INTEGER,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE components (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER REFERENCES users(id),
  brand_id INTEGER REFERENCES brands(id),
  name VARCHAR(255),
  category VARCHAR(100),
  definition JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE surface_components (
  id SERIAL PRIMARY KEY,
  surface_id INTEGER REFERENCES surfaces(id),
  component_id INTEGER REFERENCES components(id),
  position INTEGER,
  config JSONB
);

-- Media and entertainment

CREATE TABLE media_items (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  external_id VARCHAR(255),
  title VARCHAR(255),
  type VARCHAR(50),
  url TEXT,
  thumbnail_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES playlists(id),
  media_item_id INTEGER REFERENCES media_items(id),
  position INTEGER,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Commerce

CREATE TABLE commerce_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  api_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES commerce_providers(id),
  external_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  price_cents INTEGER,
  currency VARCHAR(10),
  url TEXT,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  config JSONB
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  cart_id INTEGER REFERENCES carts(id),
  total_cents INTEGER,
  currency VARCHAR(10),
  status VARCHAR(50),
  provider_payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  method VARCHAR(50),
  amount_cents INTEGER,
  currency VARCHAR(10),
  status VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social and communities

CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  visibility VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_members (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50),
  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  author_user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  body TEXT,
  media JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  kind VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning

CREATE TABLE learning_courses (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100),
  external_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  level VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES learning_courses(id),
  title VARCHAR(255),
  position INTEGER,
  media_item_id INTEGER REFERENCES media_items(id),
  metadata JSONB
);

CREATE TABLE learning_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES learning_lessons(id),
  status VARCHAR(50),
  progress_percent INTEGER,
  last_accessed_at TIMESTAMP DEFAULT NOW()
);

-- Agents and automation

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  role VARCHAR(100),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE routines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  schedule VARCHAR(100),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  kind VARCHAR(100),
  title VARCHAR(255),
  body TEXT,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings

CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  key VARCHAR(255),
  value JSONB
);
