// Centralized status and priority color utilities

export const getStatusVariant = (status) => {
  switch (status) {
    case 'done':
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'reopened':
      return 'danger';
    case 'active':
      return 'success';
    case 'on_hold':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
};

export const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'danger';
    case 'high':
      return 'warning';
    case 'medium':
      return 'primary';
    case 'low':
      return 'default';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status) => {
  return status.replace('_', ' ');
};

export const getPriorityLabel = (priority) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

