-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(255)         NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255)         NOT NULL,
  created_at     TIMESTAMP            NOT NULL DEFAULT now()
);

-- People records table
CREATE TABLE IF NOT EXISTS public.people_records (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR(255)         NOT NULL,
  age            INTEGER,
  department     VARCHAR(255),
  home_address   TEXT,
  phone_number   VARCHAR(50),
  email          VARCHAR(255),
  occupation     VARCHAR(100),
  education      TEXT,
  interests      TEXT,
  hobbies        TEXT,
  bio            TEXT,
  face_embedding DOUBLE PRECISION[]   NOT NULL,
  created_by     INTEGER              REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMP            NOT NULL DEFAULT now()
);