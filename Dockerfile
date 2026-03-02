FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY backend/ ./backend/
COPY public/ ./public/
COPY admin-views/ ./admin-views/

RUN mkdir -p uploads/events uploads/notices uploads/members uploads/gallery uploads/documents

EXPOSE 3000

CMD ["node", "backend/server.js"]
