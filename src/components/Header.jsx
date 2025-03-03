import React from "react";
import logo from "../img/logo.png";
import Hamburger from "./Hamburger";
import { AiOutlineMenu } from "react-icons/ai";
const Header = ({ toggleSidebar, isOpen }) => {
  return (
    <div className="bg-gray-800 z-100 fixed top-0 w-full left-0 h-14 border-b">
      <div className="fixed left-5 top-4">
        <img className="w-20" src={logo} alt="logo" />
      </div>
      <div className="text-menu_item_on absolute right-4 z-50 top-3 lg:hidden" onClick={toggleSidebar}>
        <Hamburger
          icon={<AiOutlineMenu className="text-white  " size={30} />}
        />
      </div>
    </div>
  );
};

export default Header;
