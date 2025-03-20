import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import axios from "axios";

interface Movie {
  id: number;
  status: "coming_soon" | "now_showing" | "ended";
}

interface MovieStats {
  total: number;
  comingSoon: number;
  nowShowing: number;
  ended: number;
}

interface MovieStatusCount {
  status: string;
  count: number;
}

export default function MonthlyTarget() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieStats, setMovieStats] = useState<MovieStats>({
    total: 0,
    comingSoon: 0,
    nowShowing: 0,
    ended: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8085/api/movies/movies-by-status"
        );
        const statusCounts = response.data;

        // Convert array response to our stats format
        const nowShowing =
          statusCounts.find(
            ([status]: [string, number]) => status === "NOW_SHOWING"
          )?.[1] || 0;
        const comingSoon =
          statusCounts.find(
            ([status]: [string, number]) => status === "COMING_SOON"
          )?.[1] || 0;
        const ended =
          statusCounts.find(
            ([status]: [string, number]) => status === "ENDED"
          )?.[1] || 0;
        const total = nowShowing + comingSoon + ended;

        setMovieStats({
          total,
          comingSoon,
          nowShowing,
          ended,
        });
      } catch (error) {
        console.error("Error fetching movie statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieStats();
  }, []);

  // Tính toán phần trăm cho biểu đồ
  const series = movieStats.total
    ? [
        (movieStats.comingSoon / movieStats.total) * 100,
        (movieStats.nowShowing / movieStats.total) * 100,
        (movieStats.ended / movieStats.total) * 100,
      ]
    : [0, 0, 0];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 330,
    },
    colors: ["#465FFF", "#10B981", "#F43F5E"], // Blue for coming soon, Green for now showing, Red for ended
    labels: ["Sắp Chiếu", "Đang Chiếu", "Đã Kết Thúc"],
    legend: {
      position: "bottom",
      labels: {
        colors: "#475569",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%";
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Thống Kê Phim
                </h3>
                <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
                  Phân bố trạng thái phim hiện tại
                </p>
              </div>
              <div className="relative inline-block">
                <button className="dropdown-toggle" onClick={toggleDropdown}>
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                </button>
                <Dropdown
                  isOpen={isOpen}
                  onClose={closeDropdown}
                  className="w-40 p-2"
                >
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    View More
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-27">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tổng Số Phim
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {movieStats.total}
                </p>
                <span className="text-sm text-green-600">
                  Tổng số phim hiện tại
                </span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Đang Chiếu
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {movieStats.nowShowing}
                </p>
                <span className="text-sm text-green-600">
                  {movieStats.total
                    ? (
                        (movieStats.nowShowing / movieStats.total) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sắp Chiếu
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {movieStats.comingSoon}
                </p>
                <span className="text-sm text-blue-600">
                  {movieStats.total
                    ? (
                        (movieStats.comingSoon / movieStats.total) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="relative">
              <Chart
                options={options}
                series={series}
                type="pie"
                height={330}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
