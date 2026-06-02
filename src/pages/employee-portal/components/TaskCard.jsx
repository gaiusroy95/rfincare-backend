import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TaskCard = ({ task, onViewDetails, onStartTask }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors?.[priority] || colors?.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      'in-progress': 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50'
    };
    return colors?.[status] || colors?.pending;
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
          <Image
            src={task?.customerImage}
            alt={task?.customerImageAlt}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
                {task?.customerName}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task?.priority)} flex-shrink-0`}>
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {task?.priority?.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                <Icon name="FileText" size={14} className="mr-2 flex-shrink-0" />
                <span className="truncate">{task?.taskType}</span>
              </div>
              
              <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                <Icon name="Hash" size={14} className="mr-2 flex-shrink-0" />
                <span>Application ID: {task?.applicationId}</span>
              </div>
              
              <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                <Icon name="Clock" size={14} className="mr-2 flex-shrink-0" />
                <span>Assigned: {formatDate(task?.assignedDate)}</span>
              </div>
              
              {task?.dueDate && (
                <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                  <Icon name="Calendar" size={14} className="mr-2 flex-shrink-0" />
                  <span>Due: {formatDate(task?.dueDate)}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {task?.documents?.map((doc, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
                >
                  <Icon name="File" size={12} className="mr-1" />
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:ml-4">
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task?.status)}`}>
            {task?.status?.replace('-', ' ')?.toUpperCase()}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(task)}
              className="flex-1 lg:flex-initial"
            >
              <Icon name="Eye" size={14} className="mr-1" />
              View
            </Button>
            
            {task?.status === 'pending' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onStartTask(task)}
                className="flex-1 lg:flex-initial"
              >
                <Icon name="Play" size={14} className="mr-1" />
                Start
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;