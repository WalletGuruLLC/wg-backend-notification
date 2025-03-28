# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.3.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

################################################################################
# Create a stage for building the application.
FROM deps as build

# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

## Use production node environment by default.

#ARG AWS_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG SECRET_NAME
#ARG NODE_ENV
#ARG MAIL_HOST
#ARG MAIL_PORT
#ARG MAIL_FROM
#ARG MAIL_USER
#ARG MAIL_PASS
#ARG SQS_QUEUE_URL
#ARG SENTRY_DSN
#ARG FRONTEND_ACTIVE_ACCOUNT_URL
#

#ENV AWS_REGION=$AWS_REGION
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV SECRET_NAME=$SECRET_NAME
#ENV NODE_ENV=$NODE_ENV
#ENV MAIL_HOST=$MAIL_HOST
#ENV MAIL_PORT=$MAIL_PORT
#ENV MAIL_FROM=$MAIL_FROM
#ENV MAIL_USER=$MAIL_USER
#ENV MAIL_PASS=$MAIL_PASS
#ENV SQS_QUEUE_URL=$SQS_QUEUE_URL
#ENV SENTRY_DSN=$SENTRY_DSN
#ENV FRONTEND_ACTIVE_ACCOUNT_URL=$FRONTEND_ACTIVE_ACCOUNT_URL

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/tsconfig.json .
COPY --from=build /usr/src/app/tsconfig.build.json .


# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm start
