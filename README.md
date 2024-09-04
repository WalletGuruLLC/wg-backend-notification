# Notification Microservice

This microservice is responsible for sending notifications to users using Node.js and NestJS as the development framework and AWS SES for sending emails. It provides functionalities such as sending welcome emails and other user notifications.

## Requirements

- Node.js (v20 or higher)
- NestJS (v10 or higher)
- AWS SES (or another SMTP server) and email verified from the STMP server

## Installation

```sh
$ npm install
```
## Configuration

### Set up the environment variables

Create a .env file in the root of the project following the content of .env.example.

## Running the Application

    npm run start

## Envs for pipeline

- `NODE_ENV`: Environment of the application (development, qa, staging, production)
- `AWS_KEY_ID`: Key ID of the AWS account
- `AWS_SECRET_ACCESS_KEY`: Secret key of the AWS account
- `AWS_REGION`: Region of the AWS account
- `MAIL_HOST`: Host of the SMTP server
- `MAIL_PORT`: Port of the SMTP server
- `MAIL_USER`: User of the SMTP server
- `MAIL_PASS`: Password of the SMTP server
- `MAIL_FROM`: Email from the SMTP server
- `FRONTEND_ACTIVE_ACCOUNT_URL`: URL of the frontend for active account
- `SENTRY_DSN`: DSN of the Sentry project
- `AWS_KEY`: Key of the AWS account for deploy image of docker in ECR
- `AWS_SECRET`: Secret of the AWS account for deploy image of docker in ECR
- `IMAGE`: Name of the image for deploy in ECR
- `CLUSTER_NAME`: Name of the cluster in ECS
- `AWS_ACCESS_KEY_ID_TERRAFORM`: Key ID of the AWS account for Terraform
- `AWS_SECRET_ACCESS_KEY_TERRAFORM`: Secret key of the AWS account for Terraform

