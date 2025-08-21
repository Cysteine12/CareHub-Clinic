FROM node:22.17 AS dev
WORKDIR /app
ENV PATH ./node_modules/.bin:$PATH

COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
