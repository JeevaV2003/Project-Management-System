#!/usr/bin/env python
import os
import sys
import django
import pymysql

pymysql.install_as_MySQLdb()

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_manager.settings')
django.setup()

from projects.models import User

def create_superadmin():
    # Check if superadmin already exists
    if User.objects.filter(username='superadmin').exists():
        print("SuperAdmin user already exists!")
        superadmin = User.objects.get(username='superadmin')
    else:
        # Create SuperAdmin user
        superadmin = User.objects.create_user(
            username='superadmin',
            email='superadmin@taskmanager.com',
            password='admin123',
            first_name='Super',
            last_name='Admin',
            role='superadmin'
        )
        superadmin.is_staff = True
        superadmin.is_superuser = True
        superadmin.save()
        print("SuperAdmin user created successfully!")
    
    print("\n" + "="*50)
    print("SUPERADMIN CREDENTIALS")
    print("="*50)
    print(f"Username: {superadmin.username}")
    print(f"Email: {superadmin.email}")
    print(f"Password: admin123")
    print(f"Role: {superadmin.role}")
    print("="*50)
    print("\nYou can now login with these credentials!")

if __name__ == '__main__':
    create_superadmin()
