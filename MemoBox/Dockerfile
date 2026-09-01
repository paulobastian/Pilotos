# MemoBox / IdeaVault — app container (development).
#
# Only the Next.js app runs here. The Supabase stack keeps running on the host
# via `npx supabase start` (also Docker, managed by the Supabase CLI). The app
# reaches it through the Docker gateway — see docker-compose.yml.
FROM node:24-bookworm-slim

WORKDIR /app

# Install dependencies from the lockfile first so this layer is cached until
# package.json / package-lock.json actually change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source so the image also works without the compose bind mount.
COPY . .

EXPOSE 3000

# Bind to 0.0.0.0 so the port is reachable from outside the container.
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
