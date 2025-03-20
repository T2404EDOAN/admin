import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import MovieOne from "../../components/movieshowtime/MovieOne";

export default function Movie() {
  return (
    <>
      <PageMeta
        title="Quản Lý Phim"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Phim" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách phim">
          <MovieOne />
        </ComponentCard>
        
      </div>
    </>
  );
}
