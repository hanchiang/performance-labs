# Given constraints
* Each log should generate a chart value
* Each log should be associated to a user  
* Chart value must be within the range [0, 100]
* Chart value increases by 10 every hour, starting at 0 for each new day

# Assumptions
* Logs will always arrive in chronological order, i.e. log date is strictly in ascending order
* Log date is in the format "YYYY-MM-DD HH:mm:ss Z"
* For each user per day, log `datetime` is unique 
* Utc offset in log date must be the same as user utc offset

# Project structure
* `seed.json`: Contains user data that are seeded into the database
* `bin/www`: Server entry point in production
* `src/config`: Contain environment variables and other configuration
* `src/db/`: MySQL sequelize setup
* `src/middleware`: Express middlewares
* `src/seed/`: Seed users into database
* `src/type`: Type definitions
* `src/util`: Utilities
* `test/`: Contains unit tests and integration tests
* `app.ts`: Express server configuration
* `server.ts`: Server entry point in development

# Setup project
* Install docker: https://docs.docker.com/get-docker/
* Install docker compose: https://docs.docker.com/compose/install/
* Rename `.env.sample` to `.env`, `.env.test.sample` to `.env.test`
* Start MySQL: `docker-compose up -d mysql`, create `analytics` and `analytics_test` database, and create the tables using `src/db/schema.sql`

# Run the project
* Start: `docker-compose up -d`
* Generate users: `npm run build && node dist/seed/seed.js`
* Stop: `docker-compose down`
