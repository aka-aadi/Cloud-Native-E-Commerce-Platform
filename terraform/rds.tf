# Data sources to reference existing VPC and subnets
data "aws_vpc" "selected_vpc" {
  filter {
    name   = "tag:Name"
    values = ["legato-vpc"] # Replace with the actual Name tag of your VPC
  }
}

data "aws_subnet" "private_az1" {
  filter {
    name   = "tag:Name"
    values = ["legato-private-subnet-az1"] # Replace with your private subnet name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

data "aws_subnet" "private_az2" {
  filter {
    name   = "tag:Name"
    values = ["legato-private-subnet-az2"] # Replace with your private subnet name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

# Data source to reference existing RDS Security Group
data "aws_security_group" "rds_sg" {
  filter {
    name   = "tag:Name"
    values = ["legato-rds-sg"] # Replace with your RDS security group name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

resource "aws_db_subnet_group" "legato_db_subnet_group" {
  name       = "legato-db-subnet-group"
  subnet_ids = [
    data.aws_subnet.private_az1.id,
    data.aws_subnet.private_az2.id
  ]
  description = "Subnet group for Legato RDS instance"
}

resource "aws_db_instance" "legato_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.2"
  instance_class       = "db.t3.micro" # Free tier eligible: db.t2.micro or db.t3.micro
  identifier           = "legato-db-instance"
  db_name              = "legato_db"
  username             = "legato_user"
  password             = "your_strong_rds_password" # IMPORTANT: Use a strong password!
  port                 = 5432
  vpc_security_group_ids = [data.aws_security_group.rds_sg.id]
  db_subnet_group_name = aws_db_subnet_group.legato_db_subnet_group.name
  skip_final_snapshot  = true
  publicly_accessible  = false # Keep false for production
  storage_type         = "gp2"
  multi_az             = false # Set to true for high availability in production (not free tier)

  tags = {
    Name = "legato-db"
  }
}

output "rds_endpoint" {
  value       = aws_db_instance.legato_db.address
  description = "The endpoint of the RDS instance"
}
