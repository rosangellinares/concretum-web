FROM node:22-alpine

WORKDIR /app

# Non-root
RUN addgroup -g 1001 -S app && adduser -S app -u 1001

# Sin dependencias que instalar: solo el server y el sitio estático
COPY --chown=app:app package.json server.js ./
COPY --chown=app:app public ./public

USER app

ENV NODE_ENV=production
ENV PORT=7779
EXPOSE 7779

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:7779/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
