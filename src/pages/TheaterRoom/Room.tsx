import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import RoomOne from "../../components/theaterroom/RoomOne";

export default function Room() {
  return (
    <>
      <PageMeta
        title="Quản lý Phòng"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Phòng" />
      <div className="space-y-6">
        <ComponentCard title="Phòng">
          <RoomOne />
        </ComponentCard>
      </div>
    </>
  );
}
