# outputs.tf

output "ec2_public_ip" {
  value       = aws_instance.legato_app_server.public_ip
  description = "The public IP address of the EC2 instance"
}

output "ec2_instance_id" {
  value       = aws_instance.legato_app_server.id
  description = "The ID of the EC2 instance"
}

output "rds_endpoint" {
  value       = aws_db_instance.legato_db.address
  description = "The endpoint of the RDS instance"
}

output "database_password_note" {
  value       = "Database password is randomly generated. Use 'terraform output database_url' to get connection string."
  description = "Note about database password"
}

output "vpc_id" {
  value       = data.aws_vpc.selected_vpc.id
  description = "The ID of the VPC"
}

output "database_url" {
  value       = "postgresql://${aws_db_instance.legato_db.username}:${random_password.db_password.result}@${aws_db_instance.legato_db.address}:5432/${aws_db_instance.legato_db.db_name}"
  description = "Database connection URL"
  sensitive   = true
}