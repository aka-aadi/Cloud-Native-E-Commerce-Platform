# rds.tf - RDS Database Configuration

# Generate a random password for the database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Note: Using random password directly instead of Secrets Manager
# to avoid IAM permission issues. For production, consider adding
# secretsmanager:CreateSecret permission to your IAM user.

# RDS Subnet Group
resource "aws_db_subnet_group" "legato_db_subnet_group" {
  name       = "legato-db-subnet-group"
  subnet_ids = [
    data.aws_subnet.private_az1.id,
    data.aws_subnet.private_az2.id
  ]
  description = "Subnet group for Legato RDS instance"

  tags = {
    Name = "legato-db-subnet-group"
    Environment = var.environment
    Project = var.project_name
  }
}

# RDS Instance
resource "aws_db_instance" "legato_db" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15.8" # Updated to available version
  instance_class         = "db.t3.micro" # Free tier eligible
  identifier             = "legato-db-instance"
  db_name                = "legato_db"
  username               = "legato_user"
  password               = random_password.db_password.result
  port                   = 5432
  vpc_security_group_ids = [data.aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.legato_db_subnet_group.name
  skip_final_snapshot    = true # Set to false for production
  publicly_accessible    = false
  storage_type           = "gp2"
  multi_az               = false # Set to true for high availability in production
  backup_retention_period = 7 # Enable automated backups
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"
  
  # Enable encryption at rest
  storage_encrypted = true
  
  # Enable deletion protection for production
  deletion_protection = false # Set to true for production

  tags = {
    Name = "legato-db"
    Environment = var.environment
    Project = var.project_name
  }
}