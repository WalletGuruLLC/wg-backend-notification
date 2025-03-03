# Notification Microservice

This microservice is responsible for sending notifications to users using Node.js and NestJS as the development framework and AWS SES for sending emails. It provides functionalities such as sending welcome emails and other user notifications.

## Requirements

- Node.js (v20 or higher)
- NestJS (v10 or higher)
- AWS SES (or another SMTP server) and email verified from the STMP server
- [Create resources of aws](https://github.com/ErgonStreamGH/wg-infra) `Wg infra`

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


- `AWS_ACCESS_KEY_ID`: Key ID of the AWS account
- `AWS_SECRET_ACCESS_KEY`: Secret key of the AWS account
- `SECRET_NAME`: Name of the secret in AWS Secrets Manager