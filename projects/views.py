from datetime import timedelta
from decimal import Decimal, InvalidOperation

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from .models import User, Project, Task, Comment, ActivityLog, Notification, Wallet, WalletTransaction
from .serializers import (
    UserSerializer, UserProfileSerializer, LoginSerializer,
    ProjectSerializer, TaskSerializer, CommentSerializer, ActivityLogSerializer,
    NotificationSerializer, WalletSerializer, WalletTransactionSerializer
)
from .permissions import (
    IsProjectMemberOrAdmin, IsAssignedOrAdmin, IsOwnerOrAdmin,
    IsSuperAdmin, IsManager, IsTeamMember
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        # Log activity
        ActivityLog.objects.create(
            user=user,
            action_type='user_joined',
            description=f'{user.username} registered to the platform'
        )
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    now = timezone.now()
    range_days = int(request.query_params.get('range_days', 7))
    range_days = max(1, min(range_days, 30))
    current_start = now - timedelta(days=range_days)
    previous_start = current_start - timedelta(days=range_days)

    if user.role in ['superadmin', 'manager']:
        projects_qs = Project.objects.all()
        tasks_qs = Task.objects.all()
    else:
        projects_qs = Project.objects.filter(
            Q(members=user) | Q(created_by=user)
        ).distinct()
        tasks_qs = Task.objects.filter(
            Q(project__in=projects_qs) | Q(assigned_to=user)
        ).distinct()

    total_projects = projects_qs.count()
    total_tasks = tasks_qs.count()
    completed_tasks = tasks_qs.filter(status='done').count()
    overdue_tasks = tasks_qs.filter(
        due_date__lt=now,
        status__in=['todo', 'in_progress']
    ).count()

    task_status_stats = list(
        tasks_qs.values('status').annotate(count=Count('id')).order_by()
    )
    priority_distribution = list(
        tasks_qs.values('priority').annotate(count=Count('id')).order_by()
    )
    project_status_summary = list(
        projects_qs.values('status').annotate(count=Count('id')).order_by()
    )

    upcoming_tasks_qs = tasks_qs.filter(
        due_date__isnull=False,
        due_date__gte=now,
        status__in=['todo', 'in_progress', 'reopened']
    ).order_by('due_date')[:5]
    upcoming_tasks = [
        {
            'id': task.id,
            'title': task.title,
            'project_name': task.project.name,
            'status': task.status,
            'priority': task.priority,
            'due_date': task.due_date,
            'is_overdue': task.is_overdue,
            'due_in_days': (task.due_date - now).days if task.due_date else None,
        }
        for task in upcoming_tasks_qs
    ]

    current_projects_created = projects_qs.filter(created_at__gte=current_start).count()
    previous_projects_created = projects_qs.filter(
        created_at__gte=previous_start,
        created_at__lt=current_start
    ).count()

    current_tasks_created = tasks_qs.filter(created_at__gte=current_start).count()
    previous_tasks_created = tasks_qs.filter(
        created_at__gte=previous_start,
        created_at__lt=current_start
    ).count()

    current_tasks_completed = tasks_qs.filter(
        status='done',
        completed_at__gte=current_start
    ).count()
    previous_tasks_completed = tasks_qs.filter(
        status='done',
        completed_at__gte=previous_start,
        completed_at__lt=current_start
    ).count()

    previous_overdue_tasks = tasks_qs.filter(
        due_date__lt=current_start,
        due_date__gte=previous_start,
        status__in=['todo', 'in_progress']
    ).count()

    stat_changes = {
        'total_projects': current_projects_created - previous_projects_created,
        'total_tasks': current_tasks_created - previous_tasks_created,
        'completed_tasks': current_tasks_completed - previous_tasks_completed,
        'overdue_tasks': overdue_tasks - previous_overdue_tasks,
    }

    decimal_zero = Decimal('0')
    total_remuneration = tasks_qs.aggregate(
        total=Coalesce(Sum('remuneration_amount'), decimal_zero)
    )['total'] or decimal_zero
    pending_remuneration = tasks_qs.filter(payment_status='pending').aggregate(
        total=Coalesce(Sum('remuneration_amount'), decimal_zero)
    )['total'] or decimal_zero
    earned_remuneration = tasks_qs.filter(payment_status='earned').aggregate(
        total=Coalesce(Sum('remuneration_amount'), decimal_zero)
    )['total'] or decimal_zero

    return Response({
        'total_projects': total_projects,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'overdue_tasks': overdue_tasks,
        'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
        'task_status_distribution': task_status_stats,
        'priority_distribution': priority_distribution,
        'project_status_summary': project_status_summary,
        'upcoming_tasks': upcoming_tasks,
        'stat_changes': stat_changes,
        'range_days': range_days,
        'remuneration': {
            'total': float(total_remuneration),
            'pending': float(pending_remuneration),
            'earned': float(earned_remuneration),
        }
    })


def _get_user_projects(user):
    if user.role == 'superadmin':
        return Project.objects.all()
    return Project.objects.filter(Q(members=user) | Q(created_by=user)).distinct()


def _get_accessible_users(user):
    if user.role == 'superadmin':
        return User.objects.all()
    if user.role == 'manager':
        manager_projects = _get_user_projects(user)
        return User.objects.filter(
            Q(id=user.id) |
            (Q(role='member') & Q(projects__in=manager_projects))
        ).distinct()
    return User.objects.filter(id=user.id)


def _ensure_user_access(requesting_user, target_user):
    if requesting_user == target_user or requesting_user.role == 'superadmin':
        return
    accessible_users = _get_accessible_users(requesting_user)
    if not accessible_users.filter(id=target_user.id).exists():
        raise PermissionDenied('Not authorized to access this user.')


def _get_accessible_tasks(user):
    if user.role == 'superadmin':
        return Task.objects.all()
    accessible_projects = _get_user_projects(user)
    return Task.objects.filter(project__in=accessible_projects).distinct()


def _ensure_project_access(user, project):
    if user.role == 'superadmin':
        return
    if not _get_user_projects(user).filter(id=project.id).exists():
        raise PermissionDenied('Not authorized to access this project.')


def _ensure_task_access(user, task):
    if user.role == 'superadmin':
        return
    if not _get_accessible_tasks(user).filter(id=task.id).exists():
        raise PermissionDenied('Not authorized to access this task.')


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _get_accessible_users(self.request.user)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectMemberOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        return _get_user_projects(user)
    
    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        project.members.add(self.request.user)
        
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='project_created',
            description=f'Created project "{project.name}"',
            project=project
        )
    
    def perform_update(self, serializer):
        project = serializer.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='project_updated',
            description=f'Updated project "{project.name}"',
            project=project
        )
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        project = self.get_object()
        _ensure_project_access(request.user, project)
        tasks = project.tasks.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        
        # Filter by assigned user if provided
        assigned_to = request.query_params.get('assigned_to')
        if assigned_to:
            tasks = tasks.filter(assigned_to_id=assigned_to)
        
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAssignedOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        queryset = _get_accessible_tasks(user)
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by priority if provided
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        return queryset
    
    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='task_created',
            description=f'Created task "{task.title}"',
            project=task.project,
            task=task
        )
    
    def perform_update(self, serializer):
        old_status = self.get_object().status
        task = serializer.save()
        
        if old_status != task.status:
            ActivityLog.objects.create(
                user=self.request.user,
                action_type='task_status_changed',
                description=f'Changed task "{task.title}" status from {old_status} to {task.status}',
                project=task.project,
                task=task
            )
        else:
            ActivityLog.objects.create(
                user=self.request.user,
                action_type='task_updated',
                description=f'Updated task "{task.title}"',
                project=task.project,
                task=task
            )


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            queryset = ActivityLog.objects.all()
        else:
            accessible_projects = _get_user_projects(user)
            queryset = ActivityLog.objects.filter(
                Q(project__in=accessible_projects) | Q(user=user)
            ).distinct()
        
        # Filter by project if provided
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset[:50]  # Limit to recent 50 activities


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsProjectMemberOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            queryset = Comment.objects.all()
        else:
            accessible_projects = _get_user_projects(user)
            queryset = Comment.objects.filter(
                Q(task__project__in=accessible_projects) |
                Q(user=user)
            ).distinct()

        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset.select_related('task', 'user')

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)

        ActivityLog.objects.create(
            user=self.request.user,
            action_type='comment_added',
            description=f'Commented on task "{comment.task.title}"',
            project=comment.task.project,
            task=comment.task
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_overview(request):
    target_user = request.user
    target_user_id = request.query_params.get('user_id')

    if target_user_id:
        if request.user.role not in ['manager', 'superadmin']:
            return Response({'detail': 'Not authorized to view other wallets.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        _ensure_user_access(request.user, target_user)

    wallet, _ = Wallet.objects.get_or_create(user=target_user, defaults={'currency': 'INR'})
    serializer = WalletSerializer(wallet)
    data = serializer.data
    data['user'] = {
        'id': target_user.id,
        'username': target_user.username,
        'first_name': target_user.first_name,
        'last_name': target_user.last_name,
        'role': target_user.role,
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_transactions(request):
    target_user = request.user
    target_user_id = request.query_params.get('user_id')

    if target_user_id:
        if request.user.role not in ['manager', 'superadmin']:
            return Response({'detail': 'Not authorized to view other wallets.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        _ensure_user_access(request.user, target_user)

    wallet, _ = Wallet.objects.get_or_create(user=target_user, defaults={'currency': 'INR'})
    transactions = wallet.transactions.all()
    serializer = WalletTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsManager])
def wallet_payout(request):
    user_id = request.data.get('user_id')
    amount = request.data.get('amount')
    description = request.data.get('description', 'Manual payout')

    if not user_id or not amount:
        return Response({'detail': 'user_id and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        amount = Decimal(amount)
    except (TypeError, ValueError, InvalidOperation):
        return Response({'detail': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

    wallet, _ = Wallet.objects.get_or_create(user=target_user, defaults={'currency': 'INR'})

    if amount > wallet.balance:
        return Response({'detail': 'Insufficient wallet balance.'}, status=status.HTTP_400_BAD_REQUEST)

    wallet.debit(amount, description)
    Task.objects.filter(assigned_to=target_user, payment_status='earned').update(payment_status='paid')

    return Response({'detail': 'Payout processed successfully.'})


# New API endpoints for role-based user management
@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def create_manager(request):
    """SuperAdmin creates manager accounts"""
    data = request.data.copy()
    data['role'] = 'manager'
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action_type='user_created',
            description=f'SuperAdmin {request.user.username} created manager {user.username}'
        )
        
        return Response({
            'message': 'Manager created successfully',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def delete_users_bulk(request):
    """SuperAdmin deletes multiple users"""
    user_ids = request.data.get('user_ids', [])
    
    if not user_ids:
        return Response({'detail': 'user_ids list is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Prevent deleting self
    if request.user.id in user_ids:
        return Response({'detail': 'Cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get users to delete (exclude superadmins)
    users_to_delete = User.objects.filter(
        id__in=user_ids,
        role__in=['member', 'manager']  # Only delete members and managers
    )
    
    deleted_count = users_to_delete.count()
    
    # Get usernames for activity log
    deleted_usernames = list(users_to_delete.values_list('username', flat=True))
    
    # Delete users
    users_to_delete.delete()
    
    # Log activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='users_deleted',
        description=f'SuperAdmin {request.user.username} deleted {deleted_count} users: {", ".join(deleted_usernames)}'
    )
    
    return Response({
        'message': f'Successfully deleted {deleted_count} user(s)',
        'deleted_count': deleted_count,
        'deleted_usernames': deleted_usernames
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsManager])
def create_member(request):
    """Manager creates team member accounts"""
    data = request.data.copy()
    data['role'] = 'member'
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action_type='user_created',
            description=f'Manager {request.user.username} created team member {user.username}'
        )
        
        return Response({
            'message': 'Team member created successfully',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Task status update endpoint with workflow
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_task_status(request, task_id):
    """Update task status with workflow logic"""
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    _ensure_task_access(request.user, task)
    
    new_status = request.data.get('status')
    if not new_status:
        return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Permission checks based on role and status
    if request.user.role == 'member':
        # Team members can only update their assigned tasks to 'done'
        if task.assigned_to != request.user:
            return Response({'error': 'You can only update your assigned tasks'}, 
                          status=status.HTTP_403_FORBIDDEN)
        if new_status not in ['in_progress', 'done']:
            return Response({'error': 'You can only mark tasks as in progress or done'}, 
                          status=status.HTTP_403_FORBIDDEN)
    elif request.user.role in ['manager', 'superadmin']:
        # Managers can approve/decline tasks marked as done
        if new_status in ['completed', 'reopened'] and task.status != 'done':
            return Response({'error': 'Can only approve/decline tasks marked as done'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    old_status = task.status
    task.status = new_status
    task.save()
    
    # Create notifications based on workflow
    if new_status == 'done' and old_status != 'done':
        # Team member marked task as done - notify manager
        if task.project.created_by and task.project.created_by.role in ['manager', 'superadmin']:
            Notification.objects.create(
                user=task.project.created_by,
                message=f'Task "{task.title}" has been marked as done by {request.user.username} and needs review.',
                task=task
            )
    
    elif new_status == 'completed' and old_status == 'done':
        # Manager approved task - notify team member
        if task.assigned_to:
            Notification.objects.create(
                user=task.assigned_to,
                message=f'Your task "{task.title}" has been approved and marked as completed.',
                task=task
            )
    
    elif new_status == 'reopened' and old_status == 'done':
        # Manager declined task - notify team member
        if task.assigned_to:
            Notification.objects.create(
                user=task.assigned_to,
                message=f'Your task "{task.title}" needs more work and has been reopened.',
                task=task
            )
    
    # Log activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='task_updated',
        description=f'{request.user.username} changed task "{task.title}" status from {old_status} to {new_status}',
        task=task,
        project=task.project
    )
    
    return Response({
        'message': 'Task status updated successfully',
        'task': TaskSerializer(task).data
    }, status=status.HTTP_200_OK)


# Notification endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get user notifications"""
    notifications = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    
    unread_count = notifications.filter(is_read=False).count()
    
    return Response({
        'notifications': serializer.data,
        'unread_count': unread_count
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    """Mark notifications as read"""
    notification_ids = request.data.get('notification_ids', [])
    
    if notification_ids:
        # Mark specific notifications as read
        Notification.objects.filter(
            id__in=notification_ids,
            user=request.user
        ).update(is_read=True)
    else:
        # Mark all notifications as read
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
    
    return Response({'message': 'Notifications marked as read'}, status=status.HTTP_200_OK)
