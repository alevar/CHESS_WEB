import React from "react";
import { Nav } from "react-bootstrap";
import "./SideBar.css";

const SideBar: React.FC = () => {
    return (
        <div className="offcanvas-md offcanvas-end bg-body-tertiary" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="sidebarMenuLabel">Company name</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center gap-2 active" aria-current="page" href="#">
                            Dashboard
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center gap-2" href="#">
                            Orders
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center gap-2" href="#">
                            Products
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center gap-2" href="#">
                            Customers
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center gap-2" href="#">
                            Reports
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center gap-2" href="#">
                            Integrations
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SideBar