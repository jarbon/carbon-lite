FROM node:22-bookworm-slim AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY mcp/package.json mcp/package-lock.json ./mcp/
RUN npm ci --prefix mcp --ignore-scripts
COPY src ./src
COPY scripts ./scripts
COPY assets ./assets
COPY references ./references
COPY skills ./skills
COPY demo-fixtures ./demo-fixtures
COPY mcp ./mcp
COPY LICENSE NOTICE.md PRIVACY.md SUPPORT.md TERMS.md ./
RUN npm run build && node mcp/build.mjs
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /build/output/mcp/0.1.0/carbon-lite /app
USER node
ENTRYPOINT ["node", "/app/mcp/server.mjs", "/workspace"]
