import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function MonthlyTarget() {
  const series = [30, 45, 25]; // Distribution percentages for movie statuses
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
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%";
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: "bottom"
        }
      }
    }]
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

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng Số Phim</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">156</p>
            <span className="text-sm text-green-600">+8 tháng này</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang Chiếu</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">70</p>
            <span className="text-sm text-green-600">45%</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Sắp Chiếu</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">47</p>
            <span className="text-sm text-blue-600">30%</span>
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
      </div>
    </div>
  );
}
