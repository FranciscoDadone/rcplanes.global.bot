FROM node:16.14.0 as production

WORKDIR /app

# Copy build files
COPY ["package.json", "tsconfig.base.json", "yarn.lock", "./"]

# Copy package.json & tsconfig.json of each workspace
ARG PACKAGE="client"
COPY ["packages/${PACKAGE}/*.json", "./packages/${PACKAGE}/"]
ARG PACKAGE="server"
COPY ["packages/${PACKAGE}/*.json", "./packages/${PACKAGE}/"]

# Install dependencies
RUN yarn install

# Copy code files
COPY . .

ENV BASE_URL = "http://instagrapi:8000"

# Build all workspaces
RUN ["yarn", "client", "build"]
RUN ["yarn", "server", "build"]

# Start server

# PRODUCTION MODE
CMD ["yarn", "server", "start"]


FROM node:16.14.0 as development

WORKDIR /app

# Copy build files
COPY ["package.json", "tsconfig.base.json", "yarn.lock", "./"]

# Copy package.json & tsconfig.json of each workspace
ARG PACKAGE="client"
COPY ["packages/${PACKAGE}/*.json", "./packages/${PACKAGE}/"]
ARG PACKAGE="server"
COPY ["packages/${PACKAGE}/*.json", "./packages/${PACKAGE}/"]

# Install dependencies
RUN yarn install

# Copy code files
COPY . .

ENV BASE_URL = "http://instagrapi:8000"

# Start server
CMD ["yarn", "dev"]
