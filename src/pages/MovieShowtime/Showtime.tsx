import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import ShowtimeOne from "../../components/movieshowtime/ShowtimeOne";

export default function Showtime() {
  return (
    <>
      <PageMeta
        title="Quản Lý Lịch chiếu"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Lịch chiếu" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách lịch chiếu">
          <ShowtimeOne />
        </ComponentCard>
        
      </div>
    </>
  );
}
