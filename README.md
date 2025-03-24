# Notification Microservice

This microservice is responsible for sending notifications to users using Node.js and NestJS as the development
framework and AWS SES for sending emails. It provides functionalities such as sending welcome emails and other user
notifications.

## Dependencies

This microservice uses the following key dependencies:

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [DynamoDB](https://aws.amazon.com/dynamodb/) - NoSQL database
- [Dynamoose](https://dynamoosejs.com/) - ORM for DynamoDB
- [AWS SDK](https://aws.amazon.com/sdk-for-node-js/) - AWS integration
- [AWS SES](https://docs.aws.amazon.com/ses/) (or another SMTP server) and email verified from the STMP server
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Secure password hashing
- [Wg-infra](https://github.com/ErgonStreamGH/wg-infra) - Deploy services with Terraform

---

## Install

### 1. Clone the Repository

```sh
git clone https://github.com/ErgonStreamGH/wg-backend-notification.git
cd wg-backend-notification
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Create envs in AWS Secrets Manager

Create a secret in AWS Secrets Manager with the name `walletguru-notification-local` and the following key-value pairs:

```
{
   "AWS_REGION":"",
   "AWS_ACCESS_KEY_ID":"",
   "AWS_SECRET_ACCESS_KEY":"",
   "SQS_QUEUE_URL":"",
   "MAIL_HOST":"",
   "MAIL_PORT":"",
   "MAIL_FROM":"",
   "MAIL_USER":"",
   "MAIL_PASS":"",
   "SENTRY_DSN":"",
   "NODE_ENV":"",
   "FRONTEND_ACTIVE_ACCOUNT_URL":""
}
```

| **Name Env**                | **Description**                                      | **REQUIRED** |
|-----------------------------|------------------------------------------------------|--------------|
| AWS_ACCESS_KEY_ID           | AWS Access Key for access to resources and service   | Yes          |
| AWS_SECRET_ACCESS_KEY       | AWS Secret Key for access to resources and service   | Yes          |
| AWS_REGION                  | AWS Region for access to resources and service       | Yes          |
| MAIL_HOST                   | Host server smtp for send emails                     | Yes          |
| MAIL_PORT                   | Port server smtp for send emails                     | Yes          |
| MAIL_FROM                   | Email address for send emails                        | Yes          |
| MAIL_USER                   | Username for server smtp for send emails             | Yes          |
| MAIL_PASS                   | Password for server smtp for send emails             | Yes          |
| SENTRY_DSN                  | If you use Sentry you can put the dsn for logs       | No           |
| NODE_ENV                    | Env for node js                                      | Yes          |
| FRONTEND_ACTIVE_ACCOUNT_URL | Url frontend for local host is http://localhost:3000 | Yes          |

### 4. Set Up Environment Variables

Create a `.env` file in the root directory and add:

```ini
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
SECRET_NAME="walletguru-notification-local"
```

### 5. Run the Application

Using **Docker Compose**:

```sh
docker-compose up
```

## Infrastructure Setup with `wg-infra`

The **wg-infra** repository is responsible for provisioning multiple AWS resources required by this project, including *
*ECR repositories, databases, IAM roles, networking, and other cloud infrastructure**.

### **Important:**

Make sure that the **Docker images of all microservices** are built and pushed to **AWS ECR** **before** installing and
running `wg-infra`. Otherwise, the infrastructure setup may fail due to missing dependencies.

## Ensure Consistency Across Microservices

Make sure you follow similar steps when setting up, deploying, and managing the following microservices hosted in the
respective repositories:


| **Microservice**                                | **Repository URL**                                               |
|-------------------------------------------------|------------------------------------------------------------------|
| Authentication Service (`backend-auth`)         | [GitHub Repo](https://github.com/WalletGuruLLC/wg-backend-auth)     |
| Notification Service (`backend-notification`)   | [GitHub Repo](https://github.com/WalletGuruLLC/wg-backend-notification)  |
| Admin Frontend (`frontend-admin`)               | [GitHub Repo](https://github.com/WalletGuruLLC/wg-frontend)   |
| Wallet Service (`backend-wallet`)               | [GitHub Repo](https://github.com/WalletGuruLLC/wg-backend-wallet)   |
| Countries Now Service (`backend-countries-now`) | [GitHub Repo](https://github.com/WalletGuruLLC/wg-countries-now) |
| Codes Service (`backend-codes`)                 | [GitHub Repo](https://github.com/WalletGuruLLC/wg-backend-codes) |
| Cron Service (`backend-codes`)                  | [GitHub Repo](https://github.com/WalletGuruLLC/wg-cron) |

Each microservice should:

1️⃣ Deploy the dependencies using Terraform in the **wg-infra** repository
2️⃣ Store environment variables securely in **AWS Secrets Manager**
3️⃣ Use **Docker Compose** for local development

