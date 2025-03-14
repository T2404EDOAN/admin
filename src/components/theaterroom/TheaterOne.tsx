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
import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import axios from "axios";

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
  status: "ACTIVE" | "MAINTENANCE" | "CLOSED";
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

export default function TheaterOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTheater, setNewTheater] = useState<Partial<Theater>>({
    status: "ACTIVE",
  });

  const statusOptions = [
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "CLOSED", label: "Đóng cửa" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit:", newTheater);
    setIsModalOpen(false);
  };
  const [loading, setLoading] = useState(false);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8081/api/theaters");

        // Lưu toàn bộ dữ liệu vào state
        setTheaters(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

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
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Theater Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Code
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Location
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Capacity
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {theaters.map((theater) => (
                <TableRow key={theater.id}>
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                    {theater.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {theater.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div>
                      <span className="block">{theater.address}</span>
                      <span className="text-xs text-gray-400">
                        {theater.district}, {theater.city}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {theater.phoneNumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {theater.totalSeats} seats / {theater.totalRooms} rooms
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      color={
                        theater.status === "ACTIVE"
                          ? "success"
                          : theater.status === "MAINTENANCE"
                          ? "warning"
                          : "error"
                      }
                    >
                      {theater.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => console.log("Edit:", theater.id)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => console.log("Delete:", theater.id)}
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

      {/* Add Theater Modal */}
      {/* <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm rạp mới
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên rạp*</Label>
                  <Input
                    type="text"
                    id="name"
                    required
                    value={newTheater.name || ""}
                    onChange={(e) =>
                      setNewTheater({ ...newTheater, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="code">Mã rạp*</Label>
                  <Input
                    type="text"
                    id="code"
                    required
                    value={newTheater.code || ""}
                    onChange={(e) =>
                      setNewTheater({ ...newTheater, code: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Địa chỉ*</Label>
                  <Input
                    type="text"
                    id="address"
                    required
                    value={newTheater.address || ""}
                    onChange={(e) =>
                      setNewTheater({ ...newTheater, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">Thành phố*</Label>
                  <Input
                    type="text"
                    id="city"
                    required
                    value={newTheater.city || ""}
                    onChange={(e) =>
                      setNewTheater({ ...newTheater, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="district">Quận/Huyện*</Label>
                  <Input
                    type="text"
                    id="district"
                    required
                    value={newTheater.district || ""}
                    onChange={(e) =>
                      setNewTheater({ ...newTheater, district: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={newTheater.phoneNumber || ""}
                    onChange={(e) =>
                      setNewTheater({
                        ...newTheater,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={newTheater.email || ""}
                    onChange={(e) =>
                      setNewTheater({ ...newTheater, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="totalSeats">Tổng số ghế*</Label>
                  <Input
                    type="number"
                    id="totalSeats"
                    required
                    value={newTheater.totalSeats || ""}
                    onChange={(e) =>
                      setNewTheater({
                        ...newTheater,
                        totalSeats: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="totalRooms">Tổng số phòng*</Label>
                  <Input
                    type="number"
                    id="totalRooms"
                    required
                    value={newTheater.totalRooms || ""}
                    onChange={(e) =>
                      setNewTheater({
                        ...newTheater,
                        totalRooms: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select
                    options={statusOptions}
                    value={newTheater.status}
                    onChange={(value) =>
                      setNewTheater({
                        ...newTheater,
                        status: value as Theater["status"],
                      })
                    }
                    placeholder="Chọn trạng thái"
                    className="dark:bg-dark-900"
                  />
                </div>
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
      </Dialog> */}
    </div>
  );
}
