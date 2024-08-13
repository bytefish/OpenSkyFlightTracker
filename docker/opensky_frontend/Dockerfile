FROM node:14 AS builder
WORKDIR /opensky-app
# Good explanation here: https://dev.to/dimitrisnl/comment/ah9f
COPY package.json /opensky-app
RUN npm install
COPY . /opensky-app
RUN $(npm bin)/ng build --prod
FROM nginx:1.15.8-alpine
COPY --from=builder /opensky-app/dist/opensky-app/ /usr/share/nginx/html