FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY tsconfig.json ./

ENV NODE_ENV=production
EXPOSE 8000

CMD ["npx", "tsx", "src/node.ts"]
