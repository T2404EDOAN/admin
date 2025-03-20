import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import UserOne from "../../components/users/UserOne";

export default function Users() {
  return (
    <>
      <PageMeta
        title="Quản lý người dùng"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Quản lý người dùng" />
      <div className="space-y-6">
        <ComponentCard title="Quản lý người dùng">
          <UserOne />
        </ComponentCard>
      </div>
    </>
  );
}
