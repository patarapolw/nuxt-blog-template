FROM node:12-alpine
RUN mkdir -p /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 8080
CMD [ "npm", "start" ]