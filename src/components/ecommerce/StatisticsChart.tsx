import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface MonthlyRevenue {
  [key: string]: number;
}

export default function StatisticsChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue>({});

  useEffect(() => {
    fetch("http://skystar.io.vn/api/payments/monthly-revenue")
      .then((res) => res.json())
      .then((data) => setMonthlyData(data))
      .catch((err) => console.error(err));
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: Object.keys(monthlyData),
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toLocaleString("vi-VN") + " đ",
      },
    },
  };

  const series = [
    {
      name: "Doanh Thu",
      data: Object.values(monthlyData),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        Thống Kê Doanh Thu Theo Tháng
      </h3>
      <div className="p-4 mb-6 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">Tổng Doanh Thu</p>
        <p className="text-2xl font-semibold">
          {Object.values(monthlyData)
            .reduce((a, b) => a + b, 0)
            .toLocaleString("vi-VN")}{" "}
          đ
        </p>
      </div>
      <Chart options={options} series={series} type="area" height={310} />
    </div>
  );
}
