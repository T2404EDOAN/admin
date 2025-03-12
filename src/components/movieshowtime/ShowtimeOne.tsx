import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { Tab } from '@headlessui/react';
import ShowtimeSeatConfig from './ShowtimeSeatConfig';

interface Theater {
  id: number;
  name: string; 
  code: string;
  address: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  phoneNumber: string;
  email?: string;
  description?: string;
  openingHours?: string;
  totalSeats: number;
  totalRooms: number;
  facilities?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
}

interface Showtime {
  id?: number;
  movieId: number;
  theaterId: number;
  roomId: number;
  showDate: string;
  showTime: string;
  endTime: string;
  basePrice: number;
  vipPrice: number;
  couplePrice?: number;
  status: 'ACTIVE' | 'CANCELLED' | 'SOLD_OUT';
  seats?: ShowtimeSeat[];
  movieName?: string;
  theaterName?: string;
  roomName?: string;
}

interface ShowtimeSeat {
  id?: number;
  showtimeId: number;
  seatId: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  price: number;
}

interface Seat {
  id: number;
  roomId: number;
  seatRow: string;
  seatNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE' | 'DISABLED';
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

const tableData: Theater[] = [
  {
    id: 1,
    name: "CGV Vincom Center",
    code: "CGV-VC-01",
    address: "123 Example Street",
    city: "Ho Chi Minh",
    district: "District 1",
    phoneNumber: "0123456789",
    totalSeats: 500,
    totalRooms: 5,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Lotte Cinema",
    code: "LTC-D2-01",
    address: "456 Sample Road",
    city: "Ho Chi Minh",
    district: "District 2",
    phoneNumber: "0987654321",
    totalSeats: 400,
    totalRooms: 4,
    status: "MAINTENANCE",
  },
  // Add more sample data as needed
];

const showtimeData: Showtime[] = [
  {
    id: 1,
    movieName: "Avengers: Endgame",
    theaterName: "CGV Vincom Center",
    roomName: "Cinema 01",
    showDate: "2024-01-20",
    showTime: "10:00",
    endTime: "12:30",
    movieId: 1,
    theaterId: 1,
    roomId: 1,
    basePrice: 90000,
    vipPrice: 120000,
    couplePrice: 200000,
    status: "ACTIVE"
  },
  {
    id: 2,
    movieName: "Avengers: Endgame",
    theaterName: "CGV Vincom Center",
    roomName: "Cinema 02",
    showDate: "2024-01-20",
    showTime: "13:00",
    endTime: "15:30",
    movieId: 1,
    theaterId: 1,
    roomId: 2,
    basePrice: 90000,
    vipPrice: 120000,
    couplePrice: 200000,
    status: "ACTIVE"
  },
  {
    id: 3,
    movieName: "Spider-Man: No Way Home",
    theaterName: "Lotte Cinema",
    roomName: "Cinema 01",
    showDate: "2024-01-20",
    showTime: "09:30",
    endTime: "11:45",
    movieId: 2,
    theaterId: 2,
    roomId: 1,
    basePrice: 85000,
    vipPrice: 110000,
    couplePrice: 180000,
    status: "SOLD_OUT"
  },
  {
    id: 4,
    movieName: "Spider-Man: No Way Home",
    theaterName: "Lotte Cinema",
    roomName: "Cinema 03",
    showDate: "2024-01-20",
    showTime: "15:00",
    endTime: "17:15",
    movieId: 2,
    theaterId: 2,
    roomId: 3,
    basePrice: 85000,
    vipPrice: 110000,
    couplePrice: 180000,
    status: "CANCELLED"
  }
];

const formTabs = [
  { name: 'Thông tin lịch chiếu', icon: 'calendar' },
  { name: 'Cài đặt giá vé', icon: 'money' },
];

export default function ShowtimeOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShowtime, setNewShowtime] = useState<Partial<Showtime>>({
    status: 'ACTIVE'
  });
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeat[]>([]);
  const [isSeatConfigOpen, setIsSeatConfigOpen] = useState(false);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);

  const movieOptions = [
    { value: "1", label: "Avengers: Endgame" },
    { value: "2", label: "Spider-Man: No Way Home" },
  ];

  const theaterOptions = [
    { value: "1", label: "CGV Vincom Center" },
    { value: "2", label: "Lotte Cinema" },
  ];

  const roomOptions = [
    { value: "1", label: "Phòng 1" },
    { value: "2", label: "Phòng 2" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "SOLD_OUT", label: "Hết vé" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', newShowtime);
    setIsModalOpen(false);
  };

  const handleSeatConfig = (showtimeId: number) => {
    setSelectedShowtimeId(showtimeId);
    setIsSeatConfigOpen(true);
  };

  const handleSaveSeats = (seats: ShowtimeSeat[]) => {
    console.log('Saved seats:', seats);
    setIsSeatConfigOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm rạp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New Theater</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* Fixed Columns */}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20">
                  STT
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[50px] bg-white dark:bg-gray-800 z-20">
                  Phim
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-20">
                  Rạp
                </TableCell>
                {/* Scrollable Columns */}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Phòng
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Ngày chiếu
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Giờ chiếu
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Giờ kết thúc
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Giá vé thường
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Giá vé VIP
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Trạng thái
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {showtimeData.map((showtime, index) => (
                <TableRow key={showtime.id}>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[50px] bg-white dark:bg-gray-800 z-10">
                    {showtime.movieName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-10">
                    {showtime.theaterName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.roomName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.showDate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.showTime}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.endTime}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.basePrice?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.vipPrice?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      color={
                        showtime.status === "ACTIVE"
                          ? "success"
                          : showtime.status === "CANCELLED"
                          ? "error"
                          : "warning"
                      }
                    >
                      {showtime.status === "ACTIVE" ? "Hoạt động" 
                        : showtime.status === "CANCELLED" ? "Đã hủy" 
                        : "Hết vé"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleSeatConfig(showtime.id!)}
                        className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                        title="Cấu hình ghế"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => console.log('Edit:', showtime.id)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => console.log('Delete:', showtime.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Showtime Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm suất chiếu mới
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Tab.Group>
                <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1">
                  {formTabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected 
                          ? 'bg-white text-blue-600 shadow' 
                          : 'text-gray-600 hover:text-gray-800'
                        }`
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="mt-4">
                  {/* Showtime Info Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phim*</Label>
                        <Select
                          options={movieOptions}
                          value={newShowtime.movieId}
                          onChange={(value) => setNewShowtime({...newShowtime, movieId: parseInt(value)})}
                          placeholder="Chọn phim"
                        />
                      </div>
                      <div>
                        <Label>Rạp chiếu*</Label>
                        <Select
                          options={theaterOptions}
                          value={newShowtime.theaterId}
                          onChange={(value) => setNewShowtime({...newShowtime, theaterId: parseInt(value)})}
                          placeholder="Chọn rạp"
                        />
                      </div>
                      <div>
                        <Label>Phòng chiếu*</Label>
                        <Select
                          options={roomOptions}
                          value={newShowtime.roomId}
                          onChange={(value) => setNewShowtime({...newShowtime, roomId: parseInt(value)})}
                          placeholder="Chọn phòng"
                        />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Select
                          options={statusOptions}
                          value={newShowtime.status}
                          onChange={(value) => setNewShowtime({...newShowtime, status: value as Showtime['status']})}
                          placeholder="Chọn trạng thái"
                        />
                      </div>
                      <div>
                        <Label>Ngày chiếu*</Label>
                        <Input
                          type="date"
                          required
                          value={newShowtime.showDate || ''}
                          onChange={e => setNewShowtime({...newShowtime, showDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Giờ bắt đầu*</Label>
                        <Input
                          type="time"
                          required
                          value={newShowtime.showTime || ''}
                          onChange={e => setNewShowtime({...newShowtime, showTime: e.target.value})}
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Price Settings Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Giá vé thường*</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={newShowtime.basePrice || ''}
                          onChange={e => setNewShowtime({...newShowtime, basePrice: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Giá vé VIP*</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={newShowtime.vipPrice || ''}
                          onChange={e => setNewShowtime({...newShowtime, vipPrice: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Giá vé Couple</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={newShowtime.couplePrice || ''}
                          onChange={e => setNewShowtime({...newShowtime, couplePrice: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Seat Configuration Modal */}
      <Dialog
        open={isSeatConfigOpen}
        onClose={() => setIsSeatConfigOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Cấu hình ghế
            </Dialog.Title>
            {selectedShowtimeId && (
              <ShowtimeSeatConfig
                showtimeId={selectedShowtimeId}
                onSave={handleSaveSeats}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
