from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'activities', views.ActivityLogViewSet, basename='activity')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.profile, name='profile'),
    
    # Dashboard stats
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Role-based user management
    path('users/create_manager/', views.create_manager, name='create_manager'),
    path('users/create_member/', views.create_member, name='create_member'),
    path('users/delete_bulk/', views.delete_users_bulk, name='delete_users_bulk'),
    
    # Task workflow
    path('tasks/<int:task_id>/status/', views.update_task_status, name='update_task_status'),
    
    # Notifications
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/read/', views.mark_notifications_read, name='mark_notifications_read'),

    # Wallet endpoints
    path('wallet/overview/', views.wallet_overview, name='wallet_overview'),
    path('wallet/transactions/', views.wallet_transactions, name='wallet_transactions'),
    path('wallet/payout/', views.wallet_payout, name='wallet_payout'),
    
    # API endpoints
    path('', include(router.urls)),
]
