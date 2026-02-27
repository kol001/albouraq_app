import { Outlet } from "react-router-dom";

const ListeParametreLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ici plus tard : navbar / sidebar */}
      <Outlet />
    </div>
  );
};

export default ListeParametreLayout;
