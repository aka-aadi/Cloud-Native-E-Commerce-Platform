#!/bin/bash

# Local Development Environment Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Local Development Environment...${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Installing Node.js...${NC}"
    
    # Install Node.js based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install node@18
        else
            echo -e "${RED}Please install Homebrew first: https://brew.sh/${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo -e "${RED}Please install Node.js manually: https://nodejs.org/${NC}"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} is installed${NC}"
fi

# Check npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} is installed${NC}"
fi

# Check Docker
if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker is not installed. Installing...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${YELLOW}Please install Docker Desktop for Mac: https://docs.docker.com/desktop/mac/install/${NC}"
        exit 1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Install Docker on Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo -e "${YELLOW}Please log out and back in for Docker permissions to take effect${NC}"
    fi
else
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ ${DOCKER_VERSION} is installed${NC}"
fi

# Check Docker Compose
if ! command_exists docker-compose; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✅ ${COMPOSE_VERSION} is installed${NC}"
fi

# Check PostgreSQL client
if ! command_exists psql; then
    echo -e "${YELLOW}Installing PostgreSQL client...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y postgresql-client
    fi
else
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✅ ${PSQL_VERSION} is installed${NC}"
fi

# Setup environment file
echo -e "${YELLOW}📝 Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
    else
        echo -e "${RED}❌ .env.example file not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Generate secrets if needed
echo -e "${YELLOW}🔐 Generating secrets...${NC}"

# Generate NextAuth secret if not set
if ! grep -q "NEXTAUTH_SECRET=" .env || grep -q "NEXTAUTH_SECRET=$" .env; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=${NEXTAUTH_SECRET}/" .env
    echo -e "${GREEN}✅ Generated NextAuth secret${NC}"
fi

# Generate encryption key if not set
if ! grep -q "ENCRYPTION_KEY=" .env || grep -q "ENCRYPTION_KEY=$" .env; then
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    sed -i.bak "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=${ENCRYPTION_KEY}/" .env
    echo -e "${GREEN}✅ Generated encryption key${NC}"
fi

# Generate JWT secret if not set
if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=$" .env; then
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
    echo -e "${GREEN}✅ Generated JWT secret${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Setup local database with Docker
echo -e "${YELLOW}🐳 Setting up local database...${NC}"

# Check if PostgreSQL container is running
if docker ps | grep -q "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL container is already running${NC}"
else
    # Start PostgreSQL container
    docker run -d \
        --name legato-postgres \
        -e POSTGRES_DB=legato_db \
        -e POSTGRES_USER=legato_user \
        -e POSTGRES_PASSWORD=legato_password \
        -p 5432:5432 \
        -v legato_postgres_data:/var/lib/postgresql/data \
        postgres:15-alpine
    
    echo -e "${GREEN}✅ PostgreSQL container started${NC}"
    
    # Wait for database to be ready
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 10
    
    # Test connection
    until docker exec legato-postgres pg_isready -U legato_user -d legato_db; do
        echo -e "${YELLOW}⏳ Waiting for database...${NC}"
        sleep 2
    done
fi

# Update .env with local database URL
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://legato_user:legato_password@localhost:5432/legato_db|" .env
echo -e "${GREEN}✅ Updated database URL in .env${NC}"

# Run database migrations
echo -e "${YELLOW}🗄️  Running database setup...${NC}"
if [ -f "scripts/database-schema.sql" ]; then
    docker exec -i legato-postgres psql -U legato_user -d legato_db < scripts/database-schema.sql
    echo -e "${GREEN}✅ Database schema created${NC}"
fi

if [ -f "scripts/sample-data.sql" ]; then
    docker exec -i legato-postgres psql -U legato_user -d legato_db < scripts/sample-data.sql
    echo -e "${GREEN}✅ Sample data inserted${NC}"
fi

# Setup Redis for caching (optional)
echo -e "${YELLOW}🔴 Setting up Redis...${NC}"
if docker ps | grep -q "redis"; then
    echo -e "${GREEN}✅ Redis container is already running${NC}"
else
    docker run -d \
        --name legato-redis \
        -p 6379:6379 \
        redis:7-alpine
    
    echo -e "${GREEN}✅ Redis container started${NC}"
    
    # Update .env with Redis URL
    sed -i.bak "s|REDIS_URL=.*|REDIS_URL=redis://localhost:6379|" .env
fi

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build
echo -e "${GREEN}✅ Application built successfully${NC}"

# Create development scripts
echo -e "${YELLOW}📜 Creating development scripts...${NC}"

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting development environment..."

# Start containers if not running
if ! docker ps | grep -q "legato-postgres"; then
    echo "Starting PostgreSQL..."
    docker start legato-postgres
fi

if ! docker ps | grep -q "legato-redis"; then
    echo "Starting Redis..."
    docker start legato-redis
fi

# Wait for services
sleep 3

# Start Next.js development server
echo "Starting Next.js development server..."
npm run dev
EOF

chmod +x start-dev.sh

# Create stop script
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping development environment..."

# Stop containers
docker stop legato-postgres legato-redis 2>/dev/null || true

echo "Development environment stopped"
EOF

chmod +x stop-dev.sh

# Create reset script
cat > reset-dev.sh << 'EOF'
#!/bin/bash
echo "🔄 Resetting development environment..."

# Stop and remove containers
docker stop legato-postgres legato-redis 2>/dev/null || true
docker rm legato-postgres legato-redis 2>/dev/null || true

# Remove volumes
docker volume rm legato_postgres_data 2>/dev/null || true

echo "Development environment reset. Run ./start-dev.sh to restart."
EOF

chmod +x reset-dev.sh

# Create test script
cat > test-dev.sh << 'EOF'
#!/bin/bash
echo "🧪 Running tests..."

# Run linting
echo "Running ESLint..."
npm run lint

# Run type checking
echo "Running TypeScript check..."
npm run type-check

# Run tests
echo "Running tests..."
npm test

echo "All tests completed!"
EOF

chmod +x test-dev.sh

echo -e "${GREEN}✅ Development scripts created${NC}"

# Create VS Code settings
echo -e "${YELLOW}⚙️  Setting up VS Code configuration...${NC}"
mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF

echo -e "${GREEN}✅ VS Code configuration created${NC}"

# Final setup verification
echo -e "${YELLOW}🔍 Verifying setup...${NC}"

# Test database connection
if docker exec legato-postgres pg_isready -U legato_user -d legato_db > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection verified${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

# Test Redis connection
if docker exec legato-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis connection verified${NC}"
else
    echo -e "${YELLOW}⚠️  Redis connection failed (optional)${NC}"
fi

# Test application build
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Application build verified${NC}"
else
    echo -e "${RED}❌ Application build failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Local development environment setup completed!${NC}"
echo ""
echo -e "${GREEN}📋 Available Commands:${NC}"
echo -e "${BLUE}./start-dev.sh${NC}     - Start development environment"
echo -e "${BLUE}./stop-dev.sh${NC}      - Stop development environment"
echo -e "${BLUE}./reset-dev.sh${NC}     - Reset development environment"
echo -e "${BLUE}./test-dev.sh${NC}      - Run tests and linting"
echo -e "${BLUE}npm run dev${NC}        - Start Next.js development server"
echo -e "${BLUE}npm run build${NC}      - Build for production"
echo -e "${BLUE}npm run start${NC}      - Start production server"
echo ""
echo -e "${GREEN}🌐 Development URLs:${NC}"
echo -e "${BLUE}Application: http://localhost:3000${NC}"
echo -e "${BLUE}Database: postgresql://legato_user:legato_password@localhost:5432/legato_db${NC}"
echo -e "${BLUE}Redis: redis://localhost:6379${NC}"
echo ""
echo -e "${YELLOW}🚀 To start development:${NC}"
echo -e "${BLUE}./start-dev.sh${NC}"
