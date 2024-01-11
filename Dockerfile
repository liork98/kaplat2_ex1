FROM node:14-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9285
CMD ["node", "ex3.js"]
