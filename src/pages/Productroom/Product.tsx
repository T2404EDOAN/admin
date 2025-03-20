import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import ProductOne from "../../components/product/ProductOne";

export default function Product() {
  return (
    <>
      <PageMeta
        title="Thêm sản phẩm"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Sản phẩm" />
      <div className="space-y-6">
        <ComponentCard title="Sản phẩm">
          <ProductOne />
        </ComponentCard>
      </div>
    </>
  );
}
