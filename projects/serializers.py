from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Project, Task, Comment, ActivityLog, Notification, Wallet, WalletTransaction


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'avatar', 'password', 'password_confirm', 'created_at')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar')
        read_only_fields = ('id', 'username')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserProfileSerializer(read_only=True)
    members = UserProfileSerializer(many=True, read_only=True)
    member_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    task_count = serializers.ReadOnlyField()
    completed_task_count = serializers.ReadOnlyField()
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'status', 'created_by', 'members', 
                 'member_ids', 'start_date', 'end_date', 'task_count', 
                 'completed_task_count', 'completion_percentage', 'created_at', 'updated_at')

    def create(self, validated_data):
        member_ids = validated_data.pop('member_ids', [])
        project = Project.objects.create(**validated_data)
        if member_ids:
            project.members.set(member_ids)
        return project

    def update(self, instance, validated_data):
        member_ids = validated_data.pop('member_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if member_ids is not None:
            instance.members.set(member_ids)
        return instance


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserProfileSerializer(read_only=True)
    assigned_to = UserProfileSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    remuneration_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'project', 'project_name', 'assigned_to', 
                 'assigned_to_id', 'created_by', 'status', 'priority', 'due_date', 
                 'completed_at', 'is_overdue', 'remuneration_amount', 'payment_status',
                 'paid_at', 'created_at', 'updated_at')

    def create(self, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        task = Task.objects.create(**validated_data)
        if assigned_to_id:
            task.assigned_to_id = assigned_to_id
            task.save()
        return task

    def update(self, instance, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if assigned_to_id is not None:
            instance.assigned_to_id = assigned_to_id
        
        instance.save()
        return instance


class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'task', 'user', 'text', 'created_at', 'updated_at')


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'action_type', 'description', 'project', 'project_name', 
                 'task', 'task_title', 'timestamp')


class NotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = ('id', 'user', 'message', 'is_read', 'created_at', 'task', 'task_title')


class WalletTransactionSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = WalletTransaction
        fields = ('id', 'amount', 'transaction_type', 'description', 'task', 'task_title', 'created_at')


class WalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ('balance', 'currency', 'transactions')
