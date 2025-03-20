import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "axios";
import { useState, useEffect } from "react";
export default function UserMetaCard() {
  const [userData, setUserData] = useState({
    id: "",
    fullName: "",
    email: "",
    avatarUrl: "/images/user/owner.jpg",
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const id = JSON.parse(localStorage.getItem("userData"))?.id;
        console.log("UserId from localStorage:", id);

        if (!id) {
          console.log("No userId found in localStorage");
          return;
        }

        const response = await axios.get(
          `http://skystar.io.vn/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("API Response:", response.data);

        if (response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error.response || error);
      }
    };

    getUserData();
  }, []);
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src={userData.avatarUrl} alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData.fullName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
