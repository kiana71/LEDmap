import React from 'react';


const Hamburger = ({ toggleSidebar, icon }) => {
    return (
        <div>
            <button>
                {icon}
            </button>
        </div>
    );
}

export default Hamburger;