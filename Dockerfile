# 1. --- Base ---
FROM node:12.16-stretch-slim AS base

RUN apt-get update && apt-get install -y git

# install dependencies first, in a different location for easier app bind mounting for local development
# due to default /opt permissions we have to create the dir with root and change perms
RUN mkdir -p /opt/analytics-service && chown -R node:node /opt/analytics-service
WORKDIR /opt/analytics-service

# the official node image provides an unprivileged user as a security best practice
# but we have to manually enable it. We put it here so npm installs dependencies as the same
# user who runs the app. 
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user
USER node
COPY package*.json ./


# 2. --- Dependencies ---
FROM base AS dependencies
ENV NODE_ENV development
ENV PORT 3000

RUN npm install
ENV PATH /opt/analytics-service/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
COPY --chown=node:node . .
CMD [ "npm", "run", "debug" ]


# 3. --- Release ---
FROM base AS release
ENV NODE_ENV production
ENV PORT 3000
ENV PATH /opt/analytics-service/node_modules/.bin:$PATH

COPY --from=dependencies ./opt/analytics-service/dist ./dist
RUN npm ci --only=production
CMD [ "npm", "run", "start" ]