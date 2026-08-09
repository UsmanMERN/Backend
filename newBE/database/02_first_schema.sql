-- db --> schema --> table --> rows 

CREATE SCHEMA IF NOT EXISTS basics;

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- query 

SELECT schema_name 

FROM information_schema.schemata
ORDER BY schema_name;


CREATE TABLE IF NOT EXISTS basics.students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INT CHECK (age >= 18),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO basics.students (name, age, email)
VALUES
    ('John Doe', 20, 'john@email.com'),
    ('Jane Doe', 22, 'john3@email.com');

    SELECT * FROM basics.students;