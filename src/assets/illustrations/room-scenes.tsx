import React from 'react';

interface RoomSceneProps {
  roomId: string;
  className?: string;
  highlightedIrregularityId?: string | null;
  reportedIrregularityIds?: string[];
}

const ROOM_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  'room-reception': {
    src: '/assets/facility-inspection/rooms/reception.jpg',
    alt: 'Main Reception and Visitor Foyer',
  },
  'room-server': {
    src: '/assets/facility-inspection/rooms/server-vault.jpg',
    alt: 'Critical Server and Data Vault',
  },
  'room-meeting': {
    src: '/assets/facility-inspection/rooms/conference-room.jpg',
    alt: 'Executive Boardroom Conference Room',
  },
  'room-security': {
    src: '/assets/facility-inspection/rooms/security-operations.jpg',
    alt: 'Security Operations Center (SOC)',
  },
  'room-storage': {
    src: '/assets/facility-inspection/rooms/storage-room.jpg',
    alt: 'Storage and Logistics Loading Bay',
  },
  'room-emergency': {
    src: '/assets/facility-inspection/rooms/fire-corridor.jpg',
    alt: 'Emergency Stairwell and Fire Exit Corridor',
  },
};

export const RoomScene: React.FC<RoomSceneProps> = ({
  roomId,
  className = '',
}) => {
  const roomData = ROOM_IMAGE_MAP[roomId] || {
    src: '/assets/facility-inspection/rooms/conference-room.jpg',
    alt: 'Inspection Room Scene',
  };

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
        src={roomData.src}
        alt={roomData.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
};
