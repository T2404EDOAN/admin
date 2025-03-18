import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";

interface Seat {
  id: string;
  name: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
}

interface SeatRow {
  row: string;
  seats: Seat[];
}

// Modify the Room interface to handle API types
interface Room {
  id: number;
  name: string;
  capacity: number;
  roomType: "2D" | "3D" | "4DX" | "IMAX" | null;
  status: "ACTIVE" | "MAINTENANCE" | "CLOSED";
}

interface Theater {
  id: number;
  name: string;
  address: string;
  status: string;
}

// Update room type mapping functions
const mapRoomTypeToApi = (roomType: Room["roomType"]): string => {
  if (!roomType) return "";
  switch (roomType) {
    case "2D":
      return "2D";
    case "3D":
      return "3D";
    case "4DX":
      return "4DX";
    case "IMAX":
      return "IMAX";
    default:
      return "";
  }
};

const mapApiToRoomType = (apiType: string): Room["roomType"] => {
  if (!apiType) return null;
  switch (apiType) {
    case "2D":
      return "2D";
    case "3D":
      return "3D";
    case "4DX":
      return "4DX";
    case "IMAX":
      return "IMAX";
    default:
      return null;
  }
};

interface ApiResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const seatData: SeatRow[] = [
  {
    row: "A",
    seats: [
      { id: "A1", name: "A1", status: "AVAILABLE" },
      { id: "A2", name: "A2", status: "AVAILABLE" },
      { id: "A3", name: "A3", status: "MAINTENANCE" },
      { id: "A4", name: "A4", status: "OCCUPIED" },
      { id: "A5", name: "A5", status: "AVAILABLE" },
    ],
  },
  {
    row: "B",
    seats: [
      { id: "B1", name: "B1", status: "AVAILABLE" },
      { id: "B2", name: "B2", status: "AVAILABLE" },
      { id: "B3", name: "B3", status: "AVAILABLE" },
      { id: "B4", name: "B4", status: "AVAILABLE" },
      { id: "B5", name: "B5", status: "AVAILABLE" },
    ],
  },
  {
    row: "C",
    seats: [
      { id: "C1", name: "C1", status: "AVAILABLE" },
      { id: "C2", name: "C2", status: "OCCUPIED" },
      { id: "C3", name: "C3", status: "AVAILABLE" },
      { id: "C4", name: "C4", status: "AVAILABLE" },
      { id: "C5", name: "C5", status: "AVAILABLE" },
    ],
  },
];

export default function RoomOne() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room & { theaterId: string }>>(
    {
      status: "ACTIVE",
      roomType: "2D",
      theaterId: "",
    }
  );
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [theaters, setTheaters] = useState<Theater[]>([]);

  // Thêm confirm state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<
    Partial<Room & { theaterId: string }>
  >({});

  const roomTypeOptions = [
    { value: "2D", label: "2D" },
    { value: "3D", label: "3D" },
    { value: "4DX", label: "4DX" },
    { value: "IMAX", label: "IMAX" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "CLOSED", label: "Đóng cửa" },
  ];

  // Modify API functions to use mapping
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/rooms");
      const mappedRooms = response.data.map((room: any) => ({
        ...room,
        roomType: mapApiToRoomType(room.roomType),
      }));
      setRooms(mappedRooms);
      console.log("Fetched rooms:", mappedRooms);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu phòng chiếu");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTheaters = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/theaters");
      console.log("Raw theaters response:", response);
      console.log("Theaters data:", response.data);
      // Kiểm tra xem response.data có phải là array không
      const theatersData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      console.log("Processed theaters data:", theatersData);
      setTheaters(theatersData);
    } catch (err) {
      console.error("Error fetching theaters:", err);
    }
  };

  const createRoom = async (roomData: Partial<Room>) => {
    try {
      console.log("Creating room with initial data:", roomData);
      const apiData = {
        ...roomData,
        roomType: mapRoomTypeToApi(roomData.roomType),
        theaterId: parseInt(roomData.theaterId as string),
      };
      console.log("Processed API data to send:", apiData);
      const response = await axios.post(
        "http://localhost:8081/api/rooms/create",
        apiData
      );
      console.log("API response:", response);
      const mappedResponse = {
        ...response.data,
        roomType: mapApiToRoomType(response.data.roomType),
      };
      console.log("Final mapped response:", mappedResponse);
      setRooms([...rooms, mappedResponse]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating room:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
      });
    }
  };

  const updateRoom = async (id: number, roomData: Partial<Room>) => {
    try {
      console.log("Updating room:", id, "with data:", roomData);
      const apiData = {
        ...roomData,
        roomType: mapRoomTypeToApi(roomData.roomType),
      };
      const response = await axios.put(
        `http://localhost:8081/api/rooms/${id}`,
        apiData
      );
      const mappedResponse = {
        ...response.data,
        roomType: mapApiToRoomType(response.data.roomType),
      };
      setRooms(rooms.map((room) => (room.id === id ? mappedResponse : room)));
    } catch (err) {
      console.error("Error updating room:", err);
    }
  };

  const deleteRoom = async (id: number) => {
    try {
      console.log("Deleting room:", id);
      await axios.delete(`http://localhost:8081/api/rooms/${id}`);
      console.log("Room deleted successfully");
      setRooms(rooms.filter((room) => room.id !== id));
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchTheaters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission data:", newRoom);
    await createRoom(newRoom);
  };

  const handleViewSeats = (room: Room) => {
    setSelectedRoom(room);
    setIsSeatsModalOpen(true);
  };

  // Thêm hàm xử lý delete
  const handleDelete = async (room: Room) => {
    setRoomToDelete(room);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (roomToDelete) {
      await deleteRoom(roomToDelete.id);
      setIsConfirmDeleteOpen(false);
      setRoomToDelete(null);
    }
  };

  // Thêm hàm xử lý edit
  const handleEdit = (room: Room) => {
    setEditingRoom({
      ...room,
      theaterId: room.theaterId?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom.id) {
      await updateRoom(editingRoom.id, editingRoom);
      setIsEditModalOpen(false);
    }
  };

  // Add filter function for search
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update room type display to handle null
  const getRoomTypeDisplay = (roomType: Room["roomType"]) => {
    return roomType || "Chưa cập nhật";
  };

  // Add theater options
  const theaterOptions = theaters.map((theater) => ({
    value: theater.id.toString(),
    label: theater.name,
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm phòng mới</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tên phòng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Sức chứa
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Loại phòng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Không tìm thấy phòng chiếu nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {room.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {room.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {room.capacity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={room.roomType ? "primary" : "warning"}
                      >
                        {getRoomTypeDisplay(room.roomType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          room.status === "ACTIVE"
                            ? "success"
                            : room.status === "MAINTENANCE"
                            ? "warning"
                            : "error"
                        }
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSeats(room)}
                          className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                          title="Xem sơ đồ ghế"
                        >
                          <ViewfinderCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(room)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Room Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm phòng mới
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Tên phòng*</Label>
                <Input
                  type="text"
                  id="name"
                  required
                  value={newRoom.name || ""}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="capacity">Sức chứa*</Label>
                <Input
                  type="number"
                  id="capacity"
                  required
                  value={newRoom.capacity || ""}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Loại phòng*</Label>
                <Select
                  options={roomTypeOptions}
                  value={newRoom.roomType}
                  onChange={(value) =>
                    setNewRoom({
                      ...newRoom,
                      roomType: value as Room["roomType"],
                    })
                  }
                  placeholder="Chọn loại phòng"
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label>Rạp</Label>
                <Select
                  options={theaterOptions}
                  value={newRoom.theaterId}
                  onChange={(value) => {
                    console.log("Selected theater value:", value);
                    setNewRoom({ ...newRoom, theaterId: value });
                  }}
                  placeholder="Chọn rạp"
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select
                  options={statusOptions}
                  value={newRoom.status}
                  onChange={(value) =>
                    setNewRoom({ ...newRoom, status: value as Room["status"] })
                  }
                  placeholder="Chọn trạng thái"
                  className="dark:bg-dark-900"
                />
              </div>

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

      {/* Seats Modal */}
      <Dialog
        open={isSeatsModalOpen}
        onClose={() => setIsSeatsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Sơ đồ ghế - {selectedRoom?.name}
            </Dialog.Title>
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex gap-4 justify-end">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded"></div>
                  <span>Trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <span>Đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded"></div>
                  <span>Bảo trì</span>
                </div>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {/* Screen */}
                <div className="text-center mb-8 p-2 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto">
                  Màn hình
                </div>

                {/* Seats */}
                <div className="space-y-4">
                  {seatData.map((row) => (
                    <div key={row.row} className="flex items-center gap-4">
                      <div className="w-8 font-bold">{row.row}</div>
                      <div className="flex gap-2 flex-1">
                        {row.seats.map((seat) => (
                          <div
                            key={seat.id}
                            className={`
                              w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer
                              ${
                                seat.status === "AVAILABLE"
                                  ? "bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                                  : ""
                              }
                              ${
                                seat.status === "OCCUPIED"
                                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                  : ""
                              }
                              ${
                                seat.status === "MAINTENANCE"
                                  ? "bg-red-100 dark:bg-red-900 cursor-not-allowed"
                                  : ""
                              }
                            `}
                            title={`Ghế ${seat.name} - ${
                              seat.status === "AVAILABLE"
                                ? "Trống"
                                : seat.status === "OCCUPIED"
                                ? "Đã đặt"
                                : "Đang bảo trì"
                            }`}
                          >
                            {seat.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsSeatsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Thêm Dialog confirm delete */}
      <Dialog
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Xác nhận xóa
            </Dialog.Title>
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa phòng "{roomToDelete?.name}" không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Thêm Edit Room Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Chỉnh sửa phòng
            </Dialog.Title>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Tên phòng*</Label>
                <Input
                  type="text"
                  id="name"
                  required
                  value={editingRoom.name || ""}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="capacity">Sức chứa*</Label>
                <Input
                  type="number"
                  id="capacity"
                  required
                  value={editingRoom.capacity || ""}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Loại phòng*</Label>
                <Select
                  options={roomTypeOptions}
                  value={editingRoom.roomType}
                  onChange={(value) =>
                    setEditingRoom({
                      ...editingRoom,
                      roomType: value as Room["roomType"],
                    })
                  }
                  placeholder="Chọn loại phòng"
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label>Rạp*</Label>
                <Select
                  options={theaterOptions}
                  value={editingRoom.theaterId}
                  onChange={(value) =>
                    setEditingRoom({ ...editingRoom, theaterId: value })
                  }
                  placeholder="Chọn rạp"
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select
                  options={statusOptions}
                  value={editingRoom.status}
                  onChange={(value) =>
                    setEditingRoom({
                      ...editingRoom,
                      status: value as Room["status"],
                    })
                  }
                  placeholder="Chọn trạng thái"
                  className="dark:bg-dark-900"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
