FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install  # <--- Cambiado de 'npm ci' a 'npm install'

COPY . .
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]