USE dineflow;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ADD COLUMN user_id INT NULL;
ALTER TABLE orders ADD FOREIGN KEY (user_id) REFERENCES users(id);

UPDATE restaurant_tables SET status = 'free';