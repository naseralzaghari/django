import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`status-badge ${status}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
