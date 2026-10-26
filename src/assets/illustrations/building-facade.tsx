import React from 'react';

interface BuildingFacadeProps {
  className?: string;
  highlightedRoomId?: string | null;
}

export const BuildingFacade: React.FC<BuildingFacadeProps> = ({
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#0F1314',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/assets/facility-inspection/facility-exterior.jpg"
        alt="Facility 04 Modern Commercial Building Facade"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
};
