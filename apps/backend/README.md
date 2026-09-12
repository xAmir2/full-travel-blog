# Explore & Share — Backend

REST API for **Explore & Share**, a full-stack travel storytelling and community platform.

The backend is built with **Java and Spring Boot** and provides authentication, authorization, content management, comments, reactions, notifications, media integration and administrative functionality.

It serves a separate React + TypeScript frontend through a REST API.

---

## Features

### Authentication & Security

- User registration
- Login and logout
- JWT authentication
- JWT delivery through HttpOnly cookies
- Password hashing
- Protected endpoints
- Role and permission-based authorization
- Configurable production cookie security
- CORS configuration for the frontend application

### User Management

- Retrieve authenticated user
- Update personal information
- Change password
- Upload and replace profile pictures
- Delete account with current-password verification
- Administrative user management

Account deletion also handles associated user data while protecting accounts that own published content from accidental self-deletion.

### Posts

- Create, read, update and delete posts
- Draft and published states
- Public access to published stories
- Slug-based story retrieval
- Pagination
- Structured post content blocks
- Text and image content
- Cloudinary image management

### Community

- Post comments
- Nested comment replies
- Post reactions
- Comment reactions
- Like/dislike behaviour
- User notifications
- Notification read state
- Notification clearing

### Administration

- User administration
- Role management
- Permission management
- Permission-protected operations
- Page hero content management
- Post administration

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Java 25 | Application language |
| Spring Boot | Backend framework |
| Spring Security | Authentication and authorization |
| Spring Data JPA | Persistence layer |
| Hibernate | ORM |
| PostgreSQL | Relational database |
| JWT | Authentication |
| Maven | Dependency management and build system |
| Cloudinary | Image storage and management |
| Jakarta Validation | Request validation |

---

## Architecture

The application follows a layered backend structure:

```text
src/main/java/amirka/back_travel_blog/
├── config/          # Application and security configuration
├── controllers/     # REST API endpoints
├── DTOs/            # API request and response models
├── entities/        # JPA entities
├── enums/           # Domain enumerations
├── exceptions/      # Application exception handling
├── repositories/    # Database access
├── security/        # JWT and authentication infrastructure
└── services/        # Business logic
```

The typical request flow is:

```text
HTTP Request
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
PostgreSQL
```

DTOs are used at the API boundary so persistence entities do not need to act as the public API contract.

---

## Domain Model

The backend manages several related areas of the application:

```text
User
 ├── Role
 │    └── Permissions
 ├── Comments
 ├── Reactions
 └── Notifications

Post
 ├── Author
 ├── Content Blocks
 ├── Comments
 └── Reactions

Comment
 ├── Author
 ├── Replies
 └── Reactions
```

This supports both the publishing side of the application and its community features.

---

## Authentication

Authentication uses JWTs stored in **HttpOnly cookies**.

After successful login:

1. The backend validates the credentials.
2. A JWT is generated.
3. The JWT is placed in an HttpOnly authentication cookie.
4. Subsequent requests send the cookie automatically.
5. Spring Security validates the token and restores the authenticated user.

This avoids storing the JWT in frontend `localStorage`.

Authorization is additionally controlled through roles and permissions for protected administrative operations.

---

## Getting Started

### Requirements

- Java 25
- PostgreSQL
- Maven or the included Maven Wrapper
- Cloudinary account for image functionality

### Environment Configuration

Local configuration can be supplied through `env.properties`.

Example:

```properties
DB_URL=jdbc:postgresql://localhost:5432/your_db_name
DB_USERNAME=postgres
DB_PASSWORD=your_database_password

JWT_SECRET=your_secure_jwt_secret

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_APIKEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

AUTH_COOKIE_NAME=session
AUTH_COOKIE_SECURE=false

FRONTEND_URL=http://localhost:5173
```

Never commit real credentials or production secrets to Git.

---

## Database

The application uses **PostgreSQL** through Spring Data JPA and Hibernate.

Database connection settings are supplied through environment variables.

During the current development/deployment workflow, Hibernate schema management uses:

```properties
spring.jpa.hibernate.ddl-auto=update
```
---

## Running Locally

Start PostgreSQL and configure the required environment variables.

Then run:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
./mvnw.cmd spring-boot:run
```

The API runs by default on:

```text
http://localhost:8080
```

---

## Testing

Run the test suite with:

```bash
./mvnw clean test
```

A successful build verifies compilation and executes the configured Spring Boot tests.

---

## Production Configuration

Production credentials should be configured through the hosting platform's environment-variable system.

Required variables include:

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=

CLOUDINARY_NAME=
CLOUDINARY_APIKEY=
CLOUDINARY_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=

AUTH_COOKIE_NAME=
AUTH_COOKIE_SECURE=true

FRONTEND_URL=
```

Never place actual production values in the repository.

For platforms using Railpack with Java 25:

```env
RAILPACK_JDK_VERSION=25
```

The application can support a platform-provided port with:

```properties
server.port=${PORT:8080}
```

---

## Production Cookies

When the frontend and backend are deployed to different HTTPS sites, authentication cookies must be configured appropriately.

Production configuration uses a secure HttpOnly cookie, with the frontend sending requests using credentials.

The backend must also allow the exact frontend origin through its CORS configuration.

---

## Media Storage

Images are stored externally using **Cloudinary**.

The backend stores the relevant image metadata/identifiers while Cloudinary handles the actual hosted media.

This is used for functionality such as:

- user avatars
- post images

Cloudinary credentials are supplied exclusively through environment variables.

---

## Error Handling & Validation

Incoming data is validated using Jakarta Validation where appropriate.

Application exceptions are handled centrally so the API can return consistent HTTP responses instead of exposing internal implementation details directly to the client.

Examples include:

- invalid credentials
- unauthorized operations
- missing resources
- invalid request data
- conflicting account information

---

## Account Deletion

Authenticated users can permanently delete their account by providing their current password.

The deletion flow:

1. verifies the current password;
2. removes associated deletable user activity;
3. deletes the user;
4. clears the authentication cookie;
5. causes the frontend session to terminate.

Accounts that own posts are protected from normal self-deletion to avoid unintentionally removing authored content.

---

## Deployment

The backend can be deployed independently from the frontend to a Java-compatible hosting provider.

A production deployment requires:

```text
Frontend
    ↓ HTTPS
Spring Boot REST API
    ↓
PostgreSQL

Spring Boot
    ↓
Cloudinary
```

This separation allows the React client, API and database to be hosted and managed independently.

---

## Project Goals

Explore & Share was developed to apply full-stack concepts in a complete application, including:

- REST API design
- layered backend architecture
- relational data modelling
- JPA/Hibernate relationships
- authentication
- authorization
- role and permission management
- secure password handling
- cookie-based JWT authentication
- file/media integration
- validation and exception handling
- PostgreSQL persistence
- frontend/backend integration
- production deployment

---

## Related Repository

The client application is implemented separately using **React, TypeScript, Vite and React Bootstrap**.

Link: https://github.com/xAmir2/front-travel-blog

---

## Author

Developed by **Amir B. Kahna** as a full-stack web development project.
