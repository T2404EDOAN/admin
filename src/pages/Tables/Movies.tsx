import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import MovieList from "../../components/tables/BasicTables/Movies";

export default function Movies() {
  return (
    <>
      <PageMeta
        title="Quản lý phim - TailAdmin"
        description="Trang quản lý phim"
      />
      <PageBreadcrumb pageTitle="Phim" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách phim">
          <MovieList />
        </ComponentCard>
      </div>
    </>
  );
}
