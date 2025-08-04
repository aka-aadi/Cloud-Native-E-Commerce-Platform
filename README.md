# Cloud-Native E-Commerce Platform

This repository contains the code for a cloud-native e-commerce platform, designed for scalability, resilience, and ease of deployment on modern cloud infrastructure.

## Features

- **Product Listing:** Browse and search for products.
- **Shopping Cart:** Add and manage items in your cart.
- **Checkout Process:** Securely complete purchases.
- **Admin Dashboard:** Manage products, orders, and users (under development).
- **Seller Portal:** Allow users to list their own products (under development).

## Technologies Used

- **Frontend:** Next.js, React, Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (via Neon.tech for serverless compatibility)
- **Containerization:** Docker
- **Infrastructure as Code:** Terraform
- **CI/CD:** Jenkins (with AWS integrations)
- **Cloud Provider:** AWS (ECS, ECR, RDS, Secrets Manager)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- Docker
- AWS CLI configured with appropriate permissions
- Terraform CLI
- PostgreSQL database (e.g., a Neon.tech instance)

### Local Development

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/aka-aadi/Cloud-Native-E-Commerce-Platform.git
    cd Cloud-Native-E-Commerce-Platform
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    pnpm install
    \`\`\`

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your database connection string:
    \`\`\`
    DATABASE_URL="postgresql://user:password@host:port/database"
    PG_CONNECTION_STRING="postgresql://user:password@host:port/database" # If using pg Pool directly
    \`\`\`
    Replace `user`, `password`, `host`, `port`, and `database` with your PostgreSQL database credentials.

4.  **Run database migrations (if any):**
    (Currently, no explicit migration scripts are provided in the repository. You might need to manually create tables based on your application's schema requirements.)

5.  **Run the development server:**
    \`\`\`bash
    pnpm dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Docker

To build and run the application using Docker:

1.  **Build the Docker image:**
    \`\`\`bash
    docker build -t cloud-native-e-commerce-platform .
    \`\`\`

2.  **Run the Docker container:**
    \`\`\`bash
    docker run -p 3000:3000 -e DATABASE_URL="your_database_url" cloud-native-e-commerce-platform
    \`\`\`
    Replace `"your_database_url"` with your actual PostgreSQL connection string.

### Deployment with Terraform (AWS)

This project includes Terraform configurations to deploy the application to AWS ECS.

1.  **Configure AWS credentials:**
    Ensure your AWS CLI is configured with credentials that have permissions to create/manage ECS, ECR, RDS, and Secrets Manager resources.

2.  **Initialize Terraform:**
    \`\`\`bash
    cd terraform
    terraform init
    \`\`\`

3.  **Plan and apply the infrastructure:**
    \`\`\`bash
    terraform plan
    terraform apply
    \`\`\`
    This will provision:
    -   An ECR repository for your Docker images.
    -   An ECS cluster and service.
    -   An RDS PostgreSQL instance (optional, if `rds.tf` is enabled).
    -   An AWS Secrets Manager secret to store database credentials.

4.  **Update Jenkinsfile:**
    Ensure your `Jenkinsfile` has the correct `AWS_ACCOUNT_ID` and `DB_SECRET_NAME` set.

### CI/CD with Jenkins

The `Jenkinsfile` defines a CI/CD pipeline for building, pushing, and deploying the application.

1.  **Set up Jenkins:**
    Ensure Jenkins is running and configured with AWS credentials.

2.  **Create a Jenkins Pipeline job:**
    -   Configure the job to pull from this Git repository.
    -   Set the build trigger (e.g., SCM polling for `main` branch).
    -   The pipeline will:
        -   Checkout the code.
        -   Build the Docker image.
        -   Push the image to ECR.
        -   Deploy the new image to the ECS service, updating environment variables from Secrets Manager.

## Project Structure

\`\`\`
.
├── app/                  # Next.js application pages and API routes
│   ├── admin/            # Admin dashboard pages
│   ├── api/              # Next.js API routes (backend logic)
│   ├── auth/             # Authentication related pages
│   ├── cart/             # Shopping cart page
│   ├── checkout/         # Checkout process page
│   ├── marketplace/      # Main product listing page
│   ├── product/[id]/     # Individual product detail page
│   ├── products/         # Product listing page (alternative/search)
│   ├── sell/             # Seller product submission page
│   ├── globals.css       # Global CSS styles
│   └── layout.tsx        # Root layout for Next.js app
├── components/           # Reusable React components
│   └── ui/               # Shadcn UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and database connection
├── public/               # Static assets (images, icons)
├── styles/               # Additional global styles
├── terraform/            # Terraform configurations for AWS infrastructure
├── Dockerfile            # Dockerfile for containerizing the application
├── Jenkinsfile           # Jenkins Pipeline definition for CI/CD
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
├── pnpm-lock.yaml        # pnpm lock file
├── postcss.config.mjs    # PostCSS configuration
├── README.md             # Project README
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
\`\`\`

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
