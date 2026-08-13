import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false
}) => {
  const baseCardClass = 'custom-base-card';
  const hoverCardClass = hoverable ? 'card-state-hoverable' : '';

  return (
    <div 
      className={`${baseCardClass} ${hoverCardClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
