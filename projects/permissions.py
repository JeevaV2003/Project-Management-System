from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow SuperAdmins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'superadmin'


class IsManager(permissions.BasePermission):
    """
    Custom permission to only allow Managers and SuperAdmins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['manager', 'superadmin']


class IsTeamMember(permissions.BasePermission):
    """
    Custom permission for TeamMembers - can only view their assigned tasks.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'member'
    
    def has_object_permission(self, request, view, obj):
        # TeamMembers can only access their assigned tasks
        if hasattr(obj, 'assigned_to'):
            return obj.assigned_to == request.user
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['manager', 'superadmin']


class IsProjectMemberOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow project members or admins to access project data.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['manager', 'superadmin']:
            return True
        
        # For Project objects
        if hasattr(obj, 'members'):
            return request.user in obj.members.all() or obj.created_by == request.user
        
        # For Task objects
        if hasattr(obj, 'project'):
            return (request.user in obj.project.members.all() or 
                   obj.project.created_by == request.user or
                   obj.assigned_to == request.user)
        
        return False


class IsAssignedOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow assigned users or admins to edit tasks.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['manager', 'superadmin']:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return obj.assigned_to == request.user or obj.created_by == request.user


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners or admins to edit objects.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['manager', 'superadmin']:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if object has created_by field
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        # Check if object has user field (for comments)
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False
