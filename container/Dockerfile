FROM jrottenberg/ffmpeg:4.1-alpine
FROM node:12-alpine

ARG NPM_TOKEN

# copy ffmpeg bins from first image
COPY --from=0 / /

WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN rm -f .npmrc
RUN npm run build
EXPOSE 8080

CMD [ "npm", "run", "start" ]