import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
  isAdminCard?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, icon, title, description, isAdminCard = false }) => {
  return (
    <Link to={to} className={`dashboard-card${isAdminCard ? ' admin-card' : ''}`}>
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
};

export default DashboardCard;
