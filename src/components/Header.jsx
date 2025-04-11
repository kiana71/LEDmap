import React from "react";
import logo from "../img/Logo_signcast_big-1080x322.png";
import Hamburger from "./Hamburger";
import { AiOutlineMenu } from "react-icons/ai";
const Header = ({ toggleSidebar, isOpen }) => {
  return (
    <div className="z-100 bg-white fixed top-0 w-full left-0 h-14 border-b z-50 ">
      <div className="fixed left-5 top-3">
        <img className="w-28" src={logo} alt="logo" />
      </div>
      <div
        className="text-menu_item_on absolute right-6 z-50 top-3 lg:hidden"
        onClick={toggleSidebar}
      >
        <Hamburger
          icon={<AiOutlineMenu className="text-black  " size={30} />}
        />
      </div>

      <div className="items-center flex flex-row absolute lg:right-4 right-16 top-2 z-50 justify-center">
        <div className="text-black">
          <p className="text-sm">User</p>
          <p className="text-gray-600 text-sm">Admin</p>
        </div>
        <div className="flex-shrink-0 flex justify-center items-center rounded-full w-10 h-10 bg-blue-100">
        <svg
            className="w-5 h-5 text-blue-500 "
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Header;
