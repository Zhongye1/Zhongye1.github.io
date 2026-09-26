# Nuxt 4 Minimal Starter

Look at the [Nuxt 4 documentation](https://nuxt.com/docs/4.x/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Linting & Formatting

Linting is powered by [oxlint](https://oxc.rs) and formatting by [Prettier](https://prettier.io).

```bash
# lint
pnpm lint          # report problems
pnpm lint:fix      # report problems and apply auto-fixes

# format
pnpm format        # format files in place
pnpm format:check  # check formatting only, no writes (useful for CI)

# types
pnpm typecheck     # run vue-tsc over the app, server, shared and node projects
```

Configuration lives in `.oxlintrc.json` and `.prettierrc` (with `.prettierignore`).
Both tools run on staged files before every commit through `lint-staged`.
