FROM node:14 AS builder
COPY . ./opensky-app
WORKDIR /opensky-app
RUN npm i
RUN $(npm bin)/ng build --prod

FROM nginx:1.15.8-alpine
COPY --from=builder /opensky-app/dist/opensky-app/ /usr/share/nginx/html