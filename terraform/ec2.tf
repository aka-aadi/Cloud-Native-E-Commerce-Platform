# ec2.tf - EC2 Instance Configuration

# EC2 Instance
resource "aws_instance" "legato_app_server" {
  ami           = "ami-08a6efd148b1f7504" # IMPORTANT: Use a valid Amazon Linux 2 or 2023 AMI ID for your region
  instance_type = "t2.micro" # Free tier eligible: t2.micro or t3.micro
  key_name      = var.ec2_key_name # IMPORTANT: Replace with your EC2 Key Pair name
  subnet_id     = data.aws_subnet.public_az1.id # Deploy in the public subnet
  vpc_security_group_ids = [data.aws_security_group.ec2_sg.id]
  associate_public_ip_address = true # Assign a public IP for direct access and Jenkins SSH

  iam_instance_profile = data.aws_iam_instance_profile.legato_ec2_profile.name

  user_data = templatefile("${path.module}/app-userdata.sh", {
    rds_endpoint     = aws_db_instance.legato_db.address
    db_username      = aws_db_instance.legato_db.username
    db_password      = random_password.db_password.result
    db_name          = aws_db_instance.legato_db.db_name
    s3_bucket        = var.s3_bucket_name
    aws_account_id   = var.aws_account_id
    aws_region       = var.aws_region
    ecr_repo_url     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/legato-ecommerce-app"
    database_url     = "postgresql://${aws_db_instance.legato_db.username}:${random_password.db_password.result}@${aws_db_instance.legato_db.address}:5432/${aws_db_instance.legato_db.db_name}"
  })

  # Enable detailed monitoring
  monitoring = true

  # EBS optimization for better performance
  ebs_optimized = true

  # Root block device configuration
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  tags = {
    Name = "legato-app-jenkins-server"
    Environment = var.environment
    Project = var.project_name
  }
}