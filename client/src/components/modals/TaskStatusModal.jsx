import React from 'react';
import Modal from '../ui/Modal';
import TaskStatusUpdate from '../tasks/TaskStatusUpdate';

const TaskStatusModal = ({ isOpen, onClose, task }) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Status"
      size="md"
    >
      <TaskStatusUpdate task={task} onClose={onClose} />
    </Modal>
  );
};

export default TaskStatusModal;
