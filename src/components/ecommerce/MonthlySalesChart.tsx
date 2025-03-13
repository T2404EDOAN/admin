import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState } from "react";

export default function MonthlySalesChart() {
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toLocaleString('vi-VN') + ' vé';
      },
      style: {
        fontSize: '12px',
        colors: ["#fff"]
      }
    },
    xaxis: {
      categories: [
        'CGV\nAeon\nTân Phú',
        'CGV\nCrescent\nMall',
        'CGV\nSư Vạn\nHạnh',
        'CGV\nVincom\nThủ Đức',
        'CGV\nPearl\nPlaza',
        'BHD\nPhạm\nHùng',
        'BHD\nQuang\nTrung',
        'Lotte\nCantavil',
        'Lotte\nNam SG',
        'Lotte\nGò Vấp',
      ],
      labels: {
        style: {
          fontSize: '12px',
        },
        rotate: -45,
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => val.toLocaleString('vi-VN'),
      }
    },
    grid: {
      show: false
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString('vi-VN')} vé`,
      },
    },
    legend: {
      show: false  // Hide the legend completely
    },
  };

  const series = [
    {
      name: "Số vé đã bán",
      data: [2450, 2100, 1950, 1850, 1800, 1700, 1650, 1500, 1450, 1400],
    },
  ];
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống Kê Vé Theo Rạp
          </h3>
        
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

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[650px] xl:min-w-full">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}
