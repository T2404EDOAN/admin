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
import { useState, useEffect } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Tab } from '@headlessui/react';
import ShowtimeSeatConfig from './ShowtimeSeatConfig';
import { Select, DatePicker, TimePicker, Pagination, message } from 'antd';
import dayjs from 'dayjs';

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
  id: number;
  theatresName: string;
  theaterAddress: string;
  movieName: string;
  theaterUrl: string | null;
  theaterLocation: string | null;
  roomId: number;
  basePrice: number;
  vipPrice: number;
  couplePrice: number | null;
  showDate: string | null;
  endDate: string | null;
  showTime: string | null;
  endTime: string | null;
  roomName: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'SOLD_OUT' | null;
  movieId: number;
  theaterId: number;
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

interface ShowtimeSeatResponse {
  id: number;
  seatId: number;
  seatName: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
}

const formTabs = [
  { name: 'Thông tin lịch chiếu', icon: 'calendar' },
  { name: 'Cài đặt giá vé', icon: 'money' },
];

interface Movie {
  movieId: number;  // Changed from id to movieId
  title: string;
}

interface TheaterCombo {
  theaterId: number;
  theaterName: string;
}

interface Room {
  id: number;
  name: string;
}

// Add this helper function for fuzzy search near the top of the file
const fuzzySearch = (str: string, search: string): boolean => {
  const searchLower = search.toLowerCase();
  const strLower = (str || '').toLowerCase();
  
  let searchIndex = 0;
  for (let i = 0; i < strLower.length && searchIndex < searchLower.length; i++) {
    if (strLower[i] === searchLower[searchIndex]) {
      searchIndex++;
    }
  }
  return searchIndex === searchLower.length;
};

export default function ShowtimeOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShowtime, setNewShowtime] = useState<Partial<Showtime>>({
    status: 'ACTIVE',
    basePrice: 0,
    vipPrice: 0,
    couplePrice: 0,
    showDate: '',  // Changed from null
    showTime: '',  // Changed from null
    endTime: '',   // Changed from null
  });
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeat[]>([]);
  const [isSeatConfigOpen, setIsSeatConfigOpen] = useState(false);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [showtimeSeats, setShowtimeSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<TheaterCombo[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [disabledTimes, setDisabledTimes] = useState<string[]>([]);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoShowtime, setAutoShowtime] = useState({
    movieId: undefined,
    theatresId: undefined,
    showDate: '',
    endDate: '',
    basePrice: 90000,
    vipPrice: 145000,
    couplePrice: 180000,
    status: 'ACTIVE'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchShowtimes = async (page = 1, size = 10) => {
    try {
      const response = await fetch(`http://localhost:8085/api/showtimes?page=${page - 1}&size=${size}`);
      const data = await response.json();
      setShowtimes(data.content || []);
      setTotalItems(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    setPageSize(pageSize || 10);
    fetchShowtimes(page, pageSize);
  };

  useEffect(() => {
    fetchShowtimes(currentPage, pageSize);
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/movies/allMovieCombo');
        const data = await response.json();
        setMovies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]); // Set empty array on error
      }
    };

    const fetchTheaters = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/theaters/allTheaterCombo');
        const data = await response.json();
        setTheaters(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching theaters:', error);
        setTheaters([]);
      }
    };

    fetchMovies();
    fetchTheaters();
  }, []);

  const fetchRooms = async (theaterId: number) => {
    try {
      const response = await fetch(`http://localhost:8085/api/theaters/${theaterId}/rooms`);
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchAvailableTimes = async (roomId: number, showDate: string) => {
    try {
      const response = await fetch(
        `http://localhost:8085/api/showtimes/available-times?roomId=${roomId}&showDate=${showDate}`
      );
      const data = await response.json();
      setDisabledTimes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setDisabledTimes([]);
    }
  };

  const handleTheaterChange = (value: string) => {
    setNewShowtime({...newShowtime, theaterId: parseInt(value), roomId: undefined});
    fetchRooms(parseInt(value));
  };

  // Replace static movieOptions with safe mapping
  const movieOptions = [{
    label: 'Danh sách phim',
    options: Array.isArray(movies) ? movies.map(movie => ({
      label: <span>{movie.title}</span>,
      value: movie.movieId
    })) : []
  }];

  const theaterOptions = [{
    label: 'Danh sách rạp',
    options: theaters.map(theater => ({
      label: <span>{theater.theaterName}</span>,
      value: theater.theaterId
    }))
  }];

  const roomOptions = [{
    label: 'Danh sách phòng',
    options: rooms.map(room => ({
      label: <span>{room.name}</span>,
      value: room.id
    }))
  }];

  const statusOptions = [{
    label: 'Trạng thái',
    options: [
      { label: <span>Hoạt động</span>, value: 'ACTIVE' },
      { label: <span>Đã hủy</span>, value: 'CANCELLED' },
      { label: <span>Hết vé</span>, value: 'SOLD_OUT' }
    ]
  }];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const showtimeData = {
        movieId: newShowtime.movieId,
        theaterId: newShowtime.theaterId,
        roomId: newShowtime.roomId,
        showDate: newShowtime.showDate || null,
        showTime: newShowtime.showTime ? newShowtime.showTime : null,
        endTime: newShowtime.endTime ? newShowtime.endTime : null,
        basePrice: newShowtime.basePrice,
        vipPrice: newShowtime.vipPrice,
        couplePrice: newShowtime.couplePrice,
        status: newShowtime.status
      };

      console.log('Submitting data:', showtimeData); // Debug log

      const response = await fetch('http://localhost:8085/api/showtimes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(showtimeData),
      });
      
      if (response.ok) {
        // Refresh showtimes list
        const fetchShowtimes = async () => {
          const response = await fetch('http://localhost:8085/api/showtimes');
          const data = await response.json();
          setShowtimes(data.content || []);
        };
        await fetchShowtimes();
        setIsModalOpen(false);
        setNewShowtime({
          status: 'ACTIVE',
          basePrice: 0,
          vipPrice: 0,
          couplePrice: 0,
          showDate: null,
          endDate: null,
          showTime: null,
          endTime: null,
        }); // Reset form
      } else {
        console.error('Failed to create showtime');
      }
    } catch (error) {
      console.error('Error creating showtime:', error);
    }
  };

  const handleSeatConfig = async (showtimeId: number) => {
    try {
      const response = await fetch(`http://localhost:8085/api/showtimes/${showtimeId}/seats`);
      const data = await response.json();
      setShowtimeSeats(data);
      setSelectedShowtimeId(showtimeId);
      setIsSeatConfigOpen(true);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const handleSaveSeats = (seats: ShowtimeSeat[]) => {
    console.log('Saved seats:', seats);
    setIsSeatConfigOpen(false);
  };

  const handleAutoGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8085/api/showtimes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(autoShowtime),
      });
      
      if (response.ok) {
        const fetchShowtimes = async () => {
          const response = await fetch('http://localhost:8085/api/showtimes');
          const data = await response.json();
          setShowtimes(data.content || []);
        };
        await fetchShowtimes();
        setIsAutoModalOpen(false);
      } else {
        console.error('Failed to generate showtimes');
      }
    } catch (error) {
      console.error('Error generating showtimes:', error);
    }
  };

  // Replace the existing filteredShowtimes with this new implementation
  const filteredShowtimes = showtimes.filter((showtime) => {
    if (!searchQuery) return true;
    
    return (
      fuzzySearch(showtime.theatresName || '', searchQuery) ||
      fuzzySearch(showtime.movieName || '', searchQuery)
    );
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
      try {
        const response = await fetch(`http://localhost:8085/api/showtimes/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          message.success('Xóa lịch chiếu thành công');
          fetchShowtimes(currentPage, pageSize);
        } else {
          message.error('Xóa lịch chiếu thất bại');
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi xóa lịch chiếu');
        console.error('Error deleting showtime:', error);
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm phim, rạp..."  // Updated placeholder
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAutoModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm lịch tự động</span>
        </button>
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
                  Trạng thái
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredShowtimes.map((showtime, index) => (
                <TableRow key={showtime.id}>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[50px] bg-white dark:bg-gray-800 z-10">
                    {showtime.movieName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-10">
                    {showtime.theatresName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.roomName || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.showDate || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.showTime || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {showtime.endTime || '-'}
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
                      {showtime.status || 'Chưa xác định'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleSeatConfig(showtime.id)}
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
                        onClick={() => handleDelete(showtime.id)}
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
          <div className="flex justify-end mt-4 px-4">
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`}
            />
          </div>
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
                          style={{ width: '100%' }}
                          placeholder="Chọn phim"
                          value={newShowtime.movieId}
                          onChange={(value) => setNewShowtime({...newShowtime, movieId: value})}
                          options={movieOptions}
                        />
                      </div>
                      <div>
                        <Label>Rạp chiếu*</Label>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="Chọn rạp"
                          value={newShowtime.theaterId}
                          onChange={handleTheaterChange}
                          options={theaterOptions}
                        />
                      </div>
                      <div>
                        <Label>Phòng chiếu*</Label>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="Chọn phòng"
                          value={newShowtime.roomId}
                          onChange={(value) => {
                            setNewShowtime({...newShowtime, roomId: value});
                            if (value && newShowtime.showDate) {
                              fetchAvailableTimes(value, newShowtime.showDate);
                            }
                          }}
                          options={roomOptions}
                          disabled={!newShowtime.theaterId}
                        />
                      </div>
                      <div>
                        <Label>Ngày chiếu*</Label>
                        <DatePicker 
                          style={{ width: '100%' }}
                          format="YYYY-MM-DD"
                          placeholder="Chọn ngày chiếu"
                          value={newShowtime.showDate ? dayjs(newShowtime.showDate) : null}
                          onChange={(date) => {
                            const formattedDate = date ? date.format('YYYY-MM-DD') : null;
                            setNewShowtime({
                              ...newShowtime, 
                              showDate: formattedDate
                            });
                            if (formattedDate && newShowtime.roomId) {
                              fetchAvailableTimes(newShowtime.roomId, formattedDate);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label>Giờ bắt đầu*</Label>
                        <TimePicker
                          style={{ width: '100%' }}
                          format="HH:mm"
                          placeholder="Chọn giờ bắt đầu"
                          value={newShowtime.showTime ? dayjs(newShowtime.showTime, 'HH:mm') : null}
                          onChange={(time) => setNewShowtime({
                            ...newShowtime,
                            showTime: time ? time.format('HH:mm') : null
                          })}
                          disabledTime={() => {
                            // Create array of hours 0-8 and 23 (disabled hours outside 9-22)
                            const disabledHours = [
                              ...Array.from({ length: 9 }, (_, i) => i),
                              ...Array.from({ length: 1 }, (_, i) => i + 24)
                            ];
                        
                            // Add hours from disabled times from API
                            const apiDisabledHours = disabledTimes.map(time => {
                              try {
                                return parseInt(time?.split(':')?.[0] || '0');
                              } catch {
                                return 0;
                              }
                            });
                        
                            return {
                              disabledHours: () => [...new Set([...disabledHours, ...apiDisabledHours])],
                              disabledMinutes: (hour) => {
                                const matchingTime = disabledTimes.find(time => {
                                  try {
                                    return parseInt(time?.split(':')?.[0] || '0') === hour;
                                  } catch {
                                    return false;
                                  }
                                });
                                if (matchingTime) {
                                  try {
                                    return [parseInt(matchingTime.split(':')[1])];
                                  } catch {
                                    return [];
                                  }
                                }
                                return [];
                              }
                            };
                          }}
                        />
                      </div>
                      <div>
                        <Label>Giờ kết thúc*</Label>
                        <TimePicker
                          style={{ width: '100%' }}
                          format="HH:mm"
                          placeholder="Chọn giờ kết thúc"
                          value={newShowtime.endTime ? dayjs(newShowtime.endTime, 'HH:mm') : null}
                          onChange={(time) => setNewShowtime({
                            ...newShowtime,
                            endTime: time ? time.format('HH:mm') : null
                          })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Trạng thái</Label>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="Chọn trạng thái"
                          value={newShowtime.status}
                          onChange={(value) => setNewShowtime({...newShowtime, status: value})}
                          options={statusOptions}
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Price Settings Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Giá vé thường (VNĐ)*</Label>
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
                        <Label>Giá vé VIP (VNĐ)*</Label>
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
                        <Label>Giá vé Couple (VNĐ)</Label>
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

      {/* Add new modal for auto generation */}
      <Dialog
        open={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Tạo lịch chiếu tự động
            </Dialog.Title>

            <form onSubmit={handleAutoGenerate} className="space-y-4">
              <div>
                <Label>Phim*</Label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn phim"
                  value={autoShowtime.movieId}
                  onChange={(value) => setAutoShowtime({...autoShowtime, movieId: value})}
                  options={movieOptions}
                />
              </div>
              <div>
                <Label>Rạp chiếu*</Label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn rạp"
                  value={autoShowtime.theatresId}
                  onChange={(value) => setAutoShowtime({...autoShowtime, theatresId: value})}
                  options={theaterOptions}
                />
              </div>
              <div>
                <Label>Ngày bắt đầu*</Label>
                <DatePicker 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Chọn ngày bắt đầu"
                  onChange={(date) => setAutoShowtime({
                    ...autoShowtime,
                    showDate: date ? date.format('YYYY-MM-DD') : ''
                  })}
                />
              </div>
              <div>
                <Label>Ngày kết thúc*</Label>
                <DatePicker 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Chọn ngày kết thúc"
                  onChange={(date) => setAutoShowtime({
                    ...autoShowtime,
                    endDate: date ? date.format('YYYY-MM-DD') : ''
                  })}
                />
              </div>
              <div>
                <Label>Giá vé thường (VNĐ)*</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={autoShowtime.basePrice}
                  onChange={e => setAutoShowtime({...autoShowtime, basePrice: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Giá vé VIP (VNĐ)*</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={autoShowtime.vipPrice}
                  onChange={e => setAutoShowtime({...autoShowtime, vipPrice: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Giá vé Couple (VNĐ)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={autoShowtime.couplePrice}
                  onChange={e => setAutoShowtime({...autoShowtime, couplePrice: parseInt(e.target.value)})}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAutoModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Tạo lịch
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
              Danh sách ghế
            </Dialog.Title>
            {selectedShowtimeId && (
              <ShowtimeSeatConfig
                showtimeId={selectedShowtimeId}
                seats={showtimeSeats}
                onSave={handleSaveSeats}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
