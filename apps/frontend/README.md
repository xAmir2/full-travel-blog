# Explore & Share — Frontend

A responsive travel storytelling platform built with **React and TypeScript**, designed around published travel stories and community interaction.

Explore & Share allows visitors to discover travel stories, while registered users can join the conversation through comments, replies and reactions. The application also includes a permission-based administration area for managing content, users, roles and page configuration.

This repository contains the **frontend application**. The API is provided by a separate Spring Boot backend.

---

## Features

### Public Experience

- Browse published travel stories
- Read individual stories through dedicated post pages
- Search and navigate published content
- Responsive navigation and layouts
- Light and dark themes
- Dynamic page hero content

### User Accounts

- Registration and login
- Secure cookie-based authentication
- Profile information management
- Profile picture upload
- Password updates
- Permanent account deletion with password confirmation

### Community

- Comments on published stories
- Nested replies
- Likes and dislikes on posts
- Likes and dislikes on comments
- User notifications
- Read and clear notification actions

### Administration

The application includes a permission-protected administration area for:

- Creating and editing travel stories
- Managing draft and published posts
- Building posts from structured content blocks
- Rich-text editing
- Uploading post images
- Managing users
- Managing roles and permissions
- Editing page hero content
- Viewing administrative information from a central dashboard

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React | Component-based UI |
| TypeScript | Static typing |
| Vite | Development and production builds |
| React Router | Client-side routing |
| Axios | Backend API communication |
| React Bootstrap | UI components and responsive layout |
| Bootstrap Icons | Interface icons |
| Lexical | Rich-text editing |

---

## Architecture

The frontend is organized by responsibility:

```text
src/
├── components/     # Reusable UI and feature components
├── context/        # Global application state and authentication
├── pages/          # Route-level application pages
├── services/       # Backend API communication
├── types/          # Shared TypeScript models
├── App.tsx         # Application routing and structure
├── main.tsx        # Application entry point
└── index.css       # Global styling
```

API communication is kept inside the service layer rather than directly inside UI components, keeping presentation and data-access responsibilities separated.

---

## Authentication

Authentication is handled using a JWT stored by the backend in an **HttpOnly cookie**.

The frontend therefore does not store authentication tokens in `localStorage` or expose them directly to JavaScript.

Axios sends authenticated requests using credentials:

```ts
withCredentials: true
```

Authentication state is managed through React context and synchronized with the backend.

---

## Getting Started

### Requirements

- Node.js
- npm
- Explore & Share backend running locally or remotely

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

The application is available by default at:

```text
http://localhost:5173
```

---

## Production Build

Create an optimized production build with:

```bash
npm run build
```

The generated application is placed in:

```text
dist/
```

The build includes TypeScript validation before Vite creates the production bundle.

---

## Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the Spring Boot REST API |

Example production configuration:

```env
VITE_API_URL=https://api.example.com
```

> Vite variables prefixed with `VITE_` are included in the client bundle and must never contain private credentials or secrets.

---

## Backend Integration

The frontend communicates with a REST API responsible for:

- authentication
- users
- roles and permissions
- posts
- content blocks
- comments
- reactions
- notifications
- media management
- configurable page content

The frontend and backend are maintained as separate applications, allowing them to be deployed independently.

---

## Deployment

The frontend is suitable for deployment to platforms such as **Netlify**.

Production deployment requires the `VITE_API_URL` environment variable to point to the publicly accessible backend.

When the frontend and backend use different origins, the backend must also allow the frontend origin and configure authentication cookies appropriately.

---

## Project Goals

Explore & Share was developed as a full-stack project to put into practice:

- component-based frontend architecture
- TypeScript
- REST API integration
- authentication and authorization
- permission-based interfaces
- responsive design
- reusable components
- asynchronous state management
- rich-text content
- production deployment

The project was designed as a complete application rather than a collection of isolated exercises.

---

## Related Repository

The backend is implemented separately using **Java, Spring Boot, Spring Security, Hibernate and PostgreSQL**.

Link: https://github.com/xAmir2/back-travel-blog

---

## Author

Developed by **Amir B. Kahna** as a full-stack web development project.
