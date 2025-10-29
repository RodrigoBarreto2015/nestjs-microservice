# ========= build =========
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ========= serve =========
FROM nginx:1.27-alpine AS serve
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./

# Nginx config para SPA + proxy opcional
RUN rm -f /etc/nginx/conf.d/default.conf
COPY <<'NGINX' /etc/nginx/conf.d/site.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
NGINX

EXPOSE 80