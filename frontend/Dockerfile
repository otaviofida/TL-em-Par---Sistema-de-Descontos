# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_STRIPE_PRICE_ID

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PRICE_ID=${VITE_STRIPE_PRICE_ID}

RUN npm run build

# ---- Production stage (Nginx) ----
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
