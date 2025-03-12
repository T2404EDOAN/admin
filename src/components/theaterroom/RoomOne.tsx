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

interface Room {
  id: number;
  theaterId: number;
  name: string;
  capacity: number;
  roomType: '2D' | '3D' | '4DX' | 'IMAX';
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
}

const tableData: Room[] = [
  {
    id: 1,
    theaterId: 1,
    name: "Room A1",
    capacity: 120,
    roomType: "2D",
    status: "ACTIVE",
  },
  {
    id: 2,
    theaterId: 1,
    name: "Room A2",
    capacity: 150,
    roomType: "3D",
    status: "MAINTENANCE",
  },
  {
    id: 3,
    theaterId: 2,
    name: "Room B1",
    capacity: 200,
    roomType: "IMAX",
    status: "ACTIVE",
  },
];

export default function RoomOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    status: 'ACTIVE',
    roomType: '2D'
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', newRoom);
    setIsModalOpen(false);
  };

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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tên phòng
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Sức chứa
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Loại phòng
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
              {tableData.map((room) => (
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
                    <Badge size="sm" color="primary">
                      {room.roomType}
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
                       
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                      
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

      {/* Add Room Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">Thêm phòng mới</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Tên phòng*</Label>
                <Input
                  type="text"
                  id="name"
                  required
                  value={newRoom.name || ''}
                  onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Sức chứa*</Label>
                <Input
                  type="number"
                  id="capacity"
                  required
                  value={newRoom.capacity || ''}
                  onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Loại phòng*</Label>
                <Select
                  options={roomTypeOptions}
                  value={newRoom.roomType}
                  onChange={(value) => setNewRoom({...newRoom, roomType: value as Room['roomType']})}
                  placeholder="Chọn loại phòng"
                  className="dark:bg-dark-900"
                />
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select
                  options={statusOptions}
                  value={newRoom.status}
                  onChange={(value) => setNewRoom({...newRoom, status: value as Room['status']})}
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
    </div>
  );
}
