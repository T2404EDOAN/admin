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
import { twMerge } from "tailwind-merge";
import { Menu } from '@headlessui/react';

interface Seat {
  id: number;
  roomId: number;
  seatRow: string;
  seatNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE' | 'DISABLED';
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

const tableData: Seat[] = [
  {
    id: 1,
    roomId: 1,
    seatRow: 'A',
    seatNumber: 1,
    seatType: 'REGULAR',
    status: 'ACTIVE'
  },
  {
    id: 2,
    roomId: 1,
    seatRow: 'A',
    seatNumber: 2,
    seatType: 'VIP',
    status: 'ACTIVE'
  },
  {
    id: 3,
    roomId: 1,
    seatRow: 'B',
    seatNumber: 1,
    seatType: 'COUPLE',
    status: 'MAINTENANCE'
  }
];

export default function SeatOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeat, setNewSeat] = useState<Partial<Seat>>({
    status: 'ACTIVE',
    seatType: 'REGULAR'
  });
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const seatTypeOptions = [
    { value: "REGULAR", label: "Thường" },
    { value: "VIP", label: "VIP" },
    { value: "COUPLE", label: "Ghế đôi" },
    { value: "DISABLED", label: "Người khuyết tật" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "INACTIVE", label: "Không hoạt động" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', newSeat);
    setIsModalOpen(false);
  };

  const handleEditSeat = (seat: Seat) => {
    setSelectedSeat(seat);
    setNewSeat(seat);
    setIsEditModalOpen(true);
  };

  const handleDeleteSeat = (seatId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa ghế này?')) {
      console.log('Delete seat:', seatId);
      // Implement delete logic here
    }
  };

  const handleAddSeatToRow = (row: string) => {
    const maxSeatNumber = seatsByRow[row] 
      ? Math.max(...seatsByRow[row].map(seat => seat.seatNumber))
      : 0;
    
    setNewSeat({
      status: 'ACTIVE',
      seatType: 'REGULAR',
      seatRow: row,
      seatNumber: maxSeatNumber + 1,
      roomId: seatsByRow[row]?.[0]?.roomId || 1
    });
    setIsModalOpen(true);
  };

  const handleAddNewRow = () => {
    // Get the last row letter and calculate next one
    const lastRow = sortedRows[sortedRows.length - 1] || '@';
    const nextRow = String.fromCharCode(lastRow.charCodeAt(0) + 1);
    
    setNewSeat({
      status: 'ACTIVE',
      seatType: 'REGULAR',
      seatRow: nextRow,
      seatNumber: 1,
      roomId: tableData[0]?.roomId || 1
    });
    setIsModalOpen(true);
  };

  // Nhóm ghế theo hàng
  const seatsByRow = tableData.reduce((acc, seat) => {
    if (!acc[seat.seatRow]) {
      acc[seat.seatRow] = [];
    }
    acc[seat.seatRow].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sắp xếp các hàng theo thứ tự alphabet
  const sortedRows = Object.keys(seatsByRow).sort();

  const getSeatColor = (type: Seat['seatType'], status: Seat['status']) => {
    if (status !== 'ACTIVE') return 'bg-gray-300';
    switch (type) {
      case 'VIP': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'COUPLE': return 'bg-pink-500 hover:bg-pink-600';
      case 'DISABLED': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-green-500 hover:bg-green-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Màn hình */}
      <div className="relative">
        <div className="w-2/3 h-16 mx-auto bg-gray-800 rounded-t-lg flex items-center justify-center">
          <span className="text-white text-lg">Màn hình</span>
        </div>
        <div className="w-2/3 h-4 mx-auto bg-gradient-to-b from-gray-800/50 to-transparent" />
      </div>

      {/* Sơ đồ ghế */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {sortedRows.map((row) => (
            <div key={row} className="flex items-center gap-4">
              <div className="w-8 text-center font-bold">{row}</div>
              <div className="flex gap-2 flex-wrap items-center">
                {seatsByRow[row]
                  .sort((a, b) => a.seatNumber - b.seatNumber)
                  .map((seat) => (
                    <Menu key={seat.id} as="div" className="relative">
                      <Menu.Button
                        className={twMerge(
                          "w-10 h-10 rounded-t-lg flex items-center justify-center text-white text-sm font-medium transition-colors",
                          getSeatColor(seat.seatType, seat.status)
                        )}
                        title={`${seat.seatRow}${seat.seatNumber} - ${seat.seatType}`}
                      >
                        {seat.seatNumber}
                      </Menu.Button>
                      <Menu.Items className="absolute z-10 mt-1 w-32 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleEditSeat(seat)}
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                              >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Sửa
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDeleteSeat(seat.id)}
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Xóa
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  ))}
                <button
                  onClick={() => handleAddSeatToRow(row)}
                  className="w-10 h-10 rounded-t-lg flex items-center justify-center text-gray-400 hover:text-gray-600 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                  title={`Thêm ghế vào hàng ${row}`}
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}

          {/* Add new row button */}
          <div className="flex items-center justify-center mt-8">
            <button
              onClick={handleAddNewRow}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm hàng mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chú thích */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-t-lg" />
            <span>Ghế thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-t-lg" />
            <span>Ghế VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500 rounded-t-lg" />
            <span>Ghế đôi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-t-lg" />
            <span>Ghế người khuyết tật</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded-t-lg" />
            <span>Ghế không hoạt động</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Tìm kiếm ghế..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm ghế mới</span>
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
                    Phòng
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Hàng
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Số ghế
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Loại ghế
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
                {tableData.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {seat.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {seat.roomId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {seat.seatRow}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {seat.seatNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="primary">
                        {seat.seatType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          seat.status === "ACTIVE"
                            ? "success"
                            : seat.status === "MAINTENANCE"
                            ? "warning"
                            : "error"
                        }
                      >
                        {seat.status}
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

        {/* Add Seat Modal */}
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
              <Dialog.Title className="text-lg font-medium mb-4">Thêm ghế mới</Dialog.Title>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="roomId">Phòng*</Label>
                  <Input
                    type="number"
                    id="roomId"
                    required
                    value={newSeat.roomId || ''}
                    onChange={e => setNewSeat({...newSeat, roomId: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="seatRow">Hàng*</Label>
                  <Input
                    type="text"
                    id="seatRow"
                    required
                    maxLength={1}
                    value={newSeat.seatRow || ''}
                    onChange={e => setNewSeat({...newSeat, seatRow: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <Label htmlFor="seatNumber">Số ghế*</Label>
                  <Input
                    type="number"
                    id="seatNumber"
                    required
                    value={newSeat.seatNumber || ''}
                    onChange={e => setNewSeat({...newSeat, seatNumber: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Loại ghế*</Label>
                  <Select
                    options={seatTypeOptions}
                    value={newSeat.seatType}
                    onChange={(value) => setNewSeat({...newSeat, seatType: value as Seat['seatType']})}
                    placeholder="Chọn loại ghế"
                    className="dark:bg-dark-900"
                  />
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select
                    options={statusOptions}
                    value={newSeat.status}
                    onChange={(value) => setNewSeat({...newSeat, status: value as Seat['status']})}
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

        {/* Edit Seat Modal */}
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
              <Dialog.Title className="text-lg font-medium mb-4">Sửa ghế</Dialog.Title>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="roomId">Phòng*</Label>
                  <Input
                    type="number"
                    id="roomId"
                    required
                    value={newSeat.roomId || ''}
                    onChange={e => setNewSeat({...newSeat, roomId: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="seatRow">Hàng*</Label>
                  <Input
                    type="text"
                    id="seatRow"
                    required
                    maxLength={1}
                    value={newSeat.seatRow || ''}
                    onChange={e => setNewSeat({...newSeat, seatRow: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <Label htmlFor="seatNumber">Số ghế*</Label>
                  <Input
                    type="number"
                    id="seatNumber"
                    required
                    value={newSeat.seatNumber || ''}
                    onChange={e => setNewSeat({...newSeat, seatNumber: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Loại ghế*</Label>
                  <Select
                    options={seatTypeOptions}
                    value={newSeat.seatType}
                    onChange={(value) => setNewSeat({...newSeat, seatType: value as Seat['seatType']})}
                    placeholder="Chọn loại ghế"
                    className="dark:bg-dark-900"
                  />
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select
                    options={statusOptions}
                    value={newSeat.status}
                    onChange={(value) => setNewSeat({...newSeat, status: value as Seat['status']})}
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
    </div>
  );
}
