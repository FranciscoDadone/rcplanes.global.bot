FROM node:16.14.0

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

# Build all workspaces
RUN ["yarn", "client", "build"]
RUN ["yarn", "server", "build"]

# Start server
CMD ["yarn", "server", "start"]
