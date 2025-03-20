import React from 'react';

interface ShowtimeSeatResponse {
  id: number;
  seatId: number;
  seatName: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
}

interface Props {
  showtimeId: number;
  seats: ShowtimeSeatResponse[];
  onSave: (seats: any[]) => void;
}

const ShowtimeSeatConfig: React.FC<Props> = ({ showtimeId, seats, onSave }) => {
  return (
    <div className="grid grid-cols-10 gap-2">
      {seats.map((seat) => (
        <div
          key={seat.id}
          className={`p-2 text-center rounded-md cursor-pointer ${
            seat.status === 'AVAILABLE' 
              ? 'bg-green-100 hover:bg-green-200' 
              : seat.status === 'RESERVED'
              ? 'bg-yellow-100'
              : 'bg-red-100'
          }`}
        >
          {seat.seatName}
        </div>
      ))}
    </div>
  );
};

export default ShowtimeSeatConfig;
