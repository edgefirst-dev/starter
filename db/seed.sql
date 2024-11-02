-- This file is used to seed the database with initial data.
-- You can run this file against your local database using:
-- ```sh
-- bun run db:seet <name>
-- ```
-- Where `<name>` is the name of your database.
-- Edit the SQL below to seed your database with the initial data you need.

-- The SQL below seeds the database with a root user with the email address
-- `test@edgefirst.dev` and the display name `John Doe`.
INSERT INTO users
  (id, email, display_name, role, email_verification_token, created_at, updated_at) 
VALUES 
  ('pix455o8e9fml7i37qw2ffic', 'test@edgefirst.dev', 'John Doe', 'root', 'otc30x0tgeghn4llocvw8258', 1730188960512, 1730188960512);

-- Here we're creating the user credentials for the root user.
-- The password_hash used below is the hash of the string 'password'
INSERT INTO users_credentials
  (id, user_id, password_hash, created_at, updated_at) 
VALUES 
  (
    'os4x4zxhdbapbkcyt6x5380p', 'pix455o8e9fml7i37qw2ffic', 
    '$2a$10$BZTY.7KwIQO9AE/Rd.n3TuzkcIwaE0V0Wd9LppZPRhHRMKq9yHZCK', 
    1730188960512, 1730188960512
  );

-- Here we're creating a team named Root Team.
INSERT INTO teams
  (id, name, created_at, updated_at) 
VALUES 
  ('gf259lidx7f4e64s4kzkisok', 'Root Team', 1730188960512, 1730188960512);

-- Here we're creating an accepted membership for the root user in the
-- Root Team.
INSERT INTO memberships
  (id, team_id, user_id, role, accepted_at, created_at, updated_at) 
VALUES 
  ('qwjpvri7hhworstxvmpusobb', 'gf259lidx7f4e64s4kzkisok', 'pix455o8e9fml7i37qw2ffic', 'owner', 1730188960512, 1730188960512, 1730188960512);
