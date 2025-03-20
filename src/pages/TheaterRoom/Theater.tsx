import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TheaterOne from "../../components/theaterroom/TheaterOne";

export default function Theater() {
  return (
    <>
      <PageMeta
        title="Quản lý rạp"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Rạp chiếu" />
      <div className="space-y-6">
        <ComponentCard title="Rạp chiếu">
          <TheaterOne />
        </ComponentCard>
      </div>
    </>
  );
}
