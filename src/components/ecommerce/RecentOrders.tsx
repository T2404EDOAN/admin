import axios from "axios";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// Update interface to match API response
interface MovieStats {
  movieTitle: string;
  totalRevenue: number;
}

export default function RecentOrders() {
  const [movieStats, setMovieStats] = useState<MovieStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieStats = async () => {
      try {
        const response = await axios.get(
          "http://skystar.io.vn/api/bookings/revenue-by-movie"
        );
        setMovieStats(response.data);
      } catch (error) {
        console.error("Error fetching movie statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieStats();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Phim doanh thu theo phim
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                STT
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tên phim
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tổng doanh thu
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {movieStats.map((movie, index) => (
              <TableRow key={index}>
                <TableCell className="py-3">{index + 1}</TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {movie.movieTitle}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  ${movie.totalRevenue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
