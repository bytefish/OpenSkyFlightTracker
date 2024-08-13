FROM node:22 AS builder
WORKDIR /opensky-app
# Good explanation here: https://dev.to/dimitrisnl/comment/ah9f
COPY package.json /opensky-app
RUN npm install
COPY . /opensky-app
RUN $(npm bin)/ng build --prod
FROM nginx:1.27.0
COPY --from=builder /opensky-app/dist/opensky-app/ /usr/share/nginx/html