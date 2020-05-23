FROM jrottenberg/ffmpeg:4.1-alpine
FROM node:12-alpine

# copy ffmpeg bins from first image
COPY --from=0 / /

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 8080

CMD [ "node", "index.js" ]