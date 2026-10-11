# LUX — Restaurant Ordering & Reservation Platform

LUX is a restaurant platform built with React and Vite. It provides a responsive interface for browsing menus, managing carts, placing orders, making table reservations, and accessing user and admin features.

## Technology Stack

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast

## Requirements

- Node.js compatible with the installed Vite version
- npm
- A running LUX backend for API-dependent features

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local URL printed by Vite.

The frontend uses `http://localhost:5000/api` as its default API endpoint for local development.

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## API Configuration

Set `VITE_API_URL` to the deployed backend API base URL when building for production. For example:

```dotenv
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

Replace the example URL with the actual backend URL. Vite environment variables prefixed with `VITE_` are exposed to browser code, so never place private credentials or server-side secrets in them.

## Security

- Do not commit `.env` files or credentials.
- Keep production secrets in the hosting provider's environment settings.
- Use HTTPS for public deployments.