# WEC Project Expo - 2025
# Orbis

Orbis is a sophisticated event management platform designed to simplify and elevate the experience of organizing, hosting, and participating in events at NITK.

## Overview

This platform features:
- Event creation and management
- User profiles and authentication
- Team formation and management
- Project submissions
- Application tracking

## Database Schema
![Orbis](https://github.com/user-attachments/assets/01384f1f-7fca-4ac9-9cc8-1f2c73f78cb2)

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Auth0

## Setup & Development Guidelines

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Project Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/orbis.git
   cd orbis
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Backend Environment Configuration**
   Create a `.env` file in the backend directory with the following variables:
   ```
   DATABASE_URL="your-supabase-postgres-connection-string"
   PORT=4000
   NODE_ENV=development
   
   # Use your frontend deployment URL in production
   CORS_ORIGIN="https://your-frontend-domain.com"
   # For local development
   # CORS_ORIGIN="http://localhost:3000"
   
   AUTH0_ISSUER_BASE_URL="your-auth0-issuer-url"
   AUTH0_AUDIENCE="your-auth0-audience"
   AUTH0_CLIENT_SECRET="your-auth0-client-secret"
   ```

4. **Prisma Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema changes to database (development only)
   npx prisma db push
   ```

5. **Start the Backend Server**
   ```bash
   npm run dev
   ```
   The backend will run on http://localhost:4000 in development

6. **Frontend Setup** (in a new terminal)
   ```bash
   cd ../frontend
   npm install
   ```

7. **Frontend Environment Configuration**
   Create a `.env` file in the frontend directory with the following variables:
   ```
   # Use your backend deployment URL in production
   VITE_API_URL="https://your-backend-domain.com"
   # For local development 
   # VITE_API_URL="http://localhost:4000"
   
   # Supabase
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   VITE_SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   
   # Auth0
   VITE_AUTH0_DOMAIN="your-auth0-domain"
   VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
   VITE_AUTH0_AUDIENCE="your-auth0-audience"
   VITE_AUTH0_SCOPE="openid profile email"
   VITE_AUTH0_REDIRECT_URI="https://your-frontend-domain.com"
   ```

8. **Start the Frontend Server**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000 in development

## Deployment Configuration

When deploying to production:

1. Update all environment variables to use your production URLs
2. Make sure your Auth0 application has the correct:
   - Allowed Callback URLs
   - Allowed Logout URLs
   - Allowed Web Origins
   - Set to your production domain

## Working with Prisma

Prisma simplifies database operations through its type-safe client. Here are some common commands:

### Useful Prisma Commands

```bash
# Update Prisma client after schema changes
npx prisma generate

# Create a migration (in development)
npx prisma migrate dev --name descriptive_name

# Apply migrations to production
npx prisma migrate deploy

# Reset the database (WARNING: Deletes all data)
npx prisma migrate reset

# Launch Prisma Studio (visual database explorer)
npx prisma studio
```

Prisma Studio will be available at http://localhost:5555 when running the `npx prisma studio` command.

### Prisma Schema

The database schema is defined in `prisma/schema.prisma`. This file defines:
- Data models
- Relationships between models
- Default values
- Indexes and constraints

Always run `npx prisma generate` after making changes to the schema to update the Prisma client.

## API Documentation

The backend provides RESTful API endpoints for various features:

- **Auth**: User registration, login, profile management
- **Events**: Create, update, list, and manage events
- **Teams**: Form teams and manage team members
- **Projects**: Submit and manage project details
- **Profiles**: Manage user profiles

## Code Practices

### Comments
- Use clear and concise comments to explain complex code blocks
- Use JSDoc style comments for functions and components

### Code Style
- Follow the Airbnb JavaScript Style Guide
- Use 2 spaces for indentation
- Prefer `const` and `let` over `var`
- Use arrow functions for anonymous functions
- Use single quotes for strings
- Place opening braces on the same line as the statement

### Variable Style
- Use camelCase for variable and function names
- Use PascalCase for React components and class names
- Use UPPER_SNAKE_CASE for constants
- Choose meaningful and descriptive names

### Commit Style
- Write clear and concise commit messages
- Use present tense and imperative mood
- Capitalize the first letter
- Include a brief description of changes
- Reference relevant issue numbers
- Use prefixes like `fix:`, `feat:`, `frontend:`, `backend:`, `misc:`

### Development Style
- Use feature branches for new features and bug fixes
- Keep the `main` branch in a deployable state
- Regularly pull changes from `main`
- Perform code reviews and seek feedback
