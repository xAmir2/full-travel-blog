## Getting Started

### Prerequisites

- [mise](https://mise.jdx.dev/getting-started.html) installed — manages the Node runtime, pnpm and uv, plus the
  development tasks (Python itself is managed by uv)
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose v2](https://docs.docker.com/compose/install/) installed

> Docker is **not** managed by mise — install it (and the Compose v2 plugin) yourself.

### First Time Setup

Install the runtimes and development tooling pinned in `mise.toml`:

```bash
mise install
```

Make sure [mise is activated in your shell](https://mise.jdx.dev/getting-started.html#activate-mise) so the managed
tools land on your `PATH`. Run `mise tasks` at any time to list the available development tasks.

### Generate environment files

#### Back-end ENV Properties

```bash
cat <<EOF > env.properties
DB_URL=jdbc:postgresql://localhost:5432/btb
DB_USERNAME=postgres
DB_PASSWORD=password
CLOUDINARY_APIKEY=
CLOUDINARY_SECRET=
CLOUDINARY_NAME=
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=password
ADMIN_EMAIL=admin@example.com
AUTH_COOKIE_NAME=__Host-session
AUTH_COOKIE_SECURE=true
EOF
```

After creating the environment variables, go to [Cloudinary](https://cloudinary.com/), create an account, and add your
Cloudinary credentials, including the API key, API secret, and cloud name.

#### Front-end ENV Properties

```bash
cat <<EOF > apps\frontend\env.local
VITE_API_URL=http://localhost:8080
EOF
```

### Start the local development environment

Once the [environment files](#generate-environment-files) are in place, you will have to install all the node modules:

```bash
mise run install
```

Once installed, you can start the development processes together:

```bash
mise run dev
```

You can also run a single process, e.g. mise run backend, mise run frontend.

#### Start the development servers

```bash
mise run dev # frontend + backend
mise run backend # backend only
mise run frontend # frontend only
```
