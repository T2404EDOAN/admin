import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Pagination } from "antd";
import dayjs from "dayjs";

interface Showtime {
  id: number;
  movieName: string;
  theatresName: string;
  roomName: string;
  showDate: string;
  endDate: string;
  showTime: string;
  endTime: string;
  status: string;
}

export default function ShowtimeList() {
  const [loading, setLoading] = useState(false);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8085/api/showtimes?pageNo=${pagination.current - 1}&pageSize=${pagination.pageSize}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch showtimes');
      const data = await response.json();
      setShowtimes(data.content || []);
      setPagination(prev => ({
        ...prev,
        total: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, [pagination.current, pagination.pageSize]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>STT</TableCell>
              <TableCell isHeader>Tên phim</TableCell>
              <TableCell isHeader>Rạp chiếu</TableCell>
              <TableCell isHeader>Phòng</TableCell>
              <TableCell isHeader>Ngày chiếu</TableCell>
              <TableCell isHeader>Ngày kết thúc</TableCell>
              <TableCell isHeader>Giờ bắt đầu</TableCell>
              <TableCell isHeader>Giờ kết thúc</TableCell>
              <TableCell isHeader>Trạng thái</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : showtimes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Không có dữ liệu lịch chiếu
                </TableCell>
              </TableRow>
            ) : (
              showtimes.map((showtime, index) => (
                <TableRow key={showtime.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{showtime.movieName}</TableCell>
                  <TableCell>{showtime.theatresName}</TableCell>
                  <TableCell>{showtime.roomName || "Chưa có"}</TableCell>
                  <TableCell>
                    {showtime.showDate ? dayjs(showtime.showDate).format("DD/MM/YYYY") : "Chưa có"}
                  </TableCell>
                  <TableCell>
                    {showtime.endDate ? dayjs(showtime.endDate).format("DD/MM/YYYY") : "Chưa có"}
                  </TableCell>
                  <TableCell>{showtime.showTime || "Chưa có"}</TableCell>
                  <TableCell>{showtime.endTime || "Chưa có"}</TableCell>
                  <TableCell>
                    <Badge 
                      size="sm"
                      color={showtime.status === "ACTIVE" ? "success" : "danger"}
                    >
                      {showtime.status || "Chưa có"}
                    </Badge>
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
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} lịch chiếu`}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showSizeChanger
          defaultPageSize={10}
          pageSizeOptions={['10', '20', '50']}
        />
      </div>
    </div>
  );
}
