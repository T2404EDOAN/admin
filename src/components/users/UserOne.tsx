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
import { Pagination } from "antd";
import Label from "../form/Label";

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  citizenId: string | null;
  address: string | null;
  avatarUrl: string | null;
  gender: string | null;
  role: string;
  status: string;
  lastLogin: number | null;
  loginAttempts: number;
  dateOfBirth: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  verified: boolean;
}

const ROLE_HIERARCHY = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  STAFF: 2,
  CUSTOMER: 1,
};

type UserRole = keyof typeof ROLE_HIERARCHY;

export default function UserOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<
    Partial<User> & { confirmPassword?: string }
  >({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    role: "CUSTOMER",
    status: "ACTIVE",
    password: "",
    confirmPassword: "",
  });

  // Add current user role state
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("CUSTOMER");

  // Add useEffect to log current role
  useEffect(() => {
    console.log("Current user role:", currentUserRole);
  }, [currentUserRole]);

  // Add function to check if can edit role
  const canEditRole = (userRole: string) => {
    return (
      ROLE_HIERARCHY[currentUserRole as UserRole] >
      ROLE_HIERARCHY[userRole as UserRole]
    );
  };

  // Add function to get available roles for editing
  const getAvailableRoles = () => {
    const currentRoleLevel = ROLE_HIERARCHY[currentUserRole as UserRole];
    return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => level < currentRoleLevel)
      .map(([role]) => role);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8085/api/users/customers`);
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      console.log("Fetched data:", data); // Add this to debug

      // Update this part to handle direct array response
      if (Array.isArray(data)) {
        setUsers(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
        }));
      } else if (data.content) {
        // Fallback for paginated response
        setUsers(data.content);
        setPagination((prev) => ({
          ...prev,
          total: data.totalElements || data.content.length,
        }));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add useEffect to handle form data when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        username: selectedUser.username,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        phoneNumber: selectedUser.phoneNumber,
        role: selectedUser.role,
        status: selectedUser.status,
      });
    } else {
      // Reset form when not editing
      setFormData({
        username: "",
        email: "",
        fullName: "",
        phoneNumber: "",
        role: "CUSTOMER",
        status: "ACTIVE",
        password: "",
        confirmPassword: "",
      });
    }
  }, [selectedUser]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  const handleEditUser = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8085/api/users/${id}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      const user = await response.json();
      setSelectedUser(user);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleUpdateUser = async (
    userId: number,
    updatedFields: Partial<User>
  ) => {
    try {
      console.log("Sending update request for user ID:", userId);
      console.log("Update payload:", updatedFields);

      const response = await fetch(
        `http://localhost:8085/api/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        }
      );

      const responseData = await response.json();
      console.log("Update response:", responseData);

      if (!response.ok) throw new Error("Failed to update user");
      await fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await fetch(`http://localhost:8085/api/users/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      // Create complete user data with all fields
      const completeUserData = {
        ...selectedUser, // Keep all existing user data
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: "CUSTOMER", // Keep as CUSTOMER since this is customer management
        status: formData.status,
      };

      console.log("Selected user:", selectedUser);
      console.log("Form data:", formData);
      console.log("Complete update data:", completeUserData);

      await handleUpdateUser(selectedUser.id, completeUserData);
    } else {
      console.log("Creating new user with data:", formData);
      await handleCreateUser(formData);
    }
  };

  const resetFormData = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phoneNumber: "",
      role: "CUSTOMER",
      status: "ACTIVE",
      password: "",
      confirmPassword: "",
    });
  };

  const handleCreateUser = async (
    userData: Partial<User> & { confirmPassword?: string }
  ) => {
    try {
      if (userData.password !== userData.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      const newUser = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        role: "CUSTOMER",
        status: "ACTIVE",
      };

      console.log("Đang tạo người dùng mới:", newUser);

      const response = await fetch("http://localhost:8085/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const responseData = await response.json();
      console.log("Phản hồi từ máy chủ:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể tạo người dùng mới");
      }

      alert("Tạo người dùng mới thành công!");
      await fetchUsers();
      setIsModalOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Lỗi khi tạo người dùng:", error);
      alert("Không thể tạo người dùng mới. Vui lòng kiểm tra lại thông tin.");
    }
  };

  // Update Dialog onClose to reset form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    resetFormData();
  };

  const startIndex = (pagination.current - 1) * pagination.pageSize;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell
                isHeader
                className="w-16 px-5 py-3 text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20r"
              >
                STT
              </TableCell>

              <TableCell
                isHeader
                className="w-40 px-5 py-3  text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400"
              >
                Họ và tên
              </TableCell>
              <TableCell
                isHeader
                className="w-40 px-5 py-3 text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="w-32 px-5 py-3  text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400"
              >
                Số điện thoại
              </TableCell>
              <TableCell
                isHeader
                className="w-24 px-5 py-3  text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400"
              >
                Vai trò
              </TableCell>
              <TableCell
                isHeader
                className="w-24 px-5 py-3 text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400"
              >
                Trạng thái
              </TableCell>
              <TableCell
                isHeader
                className="w-24 px-5 py-3  text-center font-medium text-gray-500  text-theme-xs dark:text-gray-400"
              >
                Điểm
              </TableCell>
              <TableCell
                isHeader
                className="w-32 px-5 py-3 text-centerfont-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Không có dữ liệu người dùng
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    <Badge
                      size="sm"
                      color={user.role === "ADMIN" ? "success" : "warning"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    <Badge
                      size="sm"
                      color={user.status === "ACTIVE" ? "success" : "error"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    {user.lastLogin || 0}
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} người dùng`
          }
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showSizeChanger
          defaultPageSize={10}
          pageSizeOptions={["10", "20", "50"]}
        />
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel class="mx-auto max-w-xl w-full rounded-lg bg-white p-6">
            <Dialog.Title class="text-lg font-medium mb-4">
              {selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Vai trò</Label>
                  {selectedUser && !canEditRole(selectedUser.role) ? (
                    <Input
                      id="role"
                      value={formData.role}
                      disabled
                      className="bg-gray-100"
                    />
                  ) : (
                    <select
                      id="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      required
                    >
                      {!selectedUser ? (
                        <option value="CUSTOMER">CUSTOMER</option>
                      ) : (
                        getAvailableRoles().map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <select
                    id="status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </div>
                {!selectedUser && (
                  <>
                    <div>
                      <Label htmlFor="password">Mật khẩu</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={!selectedUser}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required={!selectedUser}
                      />
                    </div>
                  </>
                )}
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  class="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {selectedUser ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
