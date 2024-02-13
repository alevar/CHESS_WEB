import React from "react";
import { Nav } from 'react-bootstrap';
import "./SideBar.scss";

const SideBar: React.FC = () => {

    return (
        <div className="offcanvas-md offcanvas-end bg-body-tertiary" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="sidebarMenuLabel">Company name</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body d-md-flex p-0 pt-lg-3 overflow-y-auto">
                <ul className="nav nav-tabs left-tabs sideways-tabs" role="tablist">
                    <li className="nav-item" role="presentation">
                        <div id="lorem-sideways-left-tab" className="nav-link tab-clickable active" role="tab" data-bs-toggle="tab" data-bs-target="#lorem-sideways-left" aria-controls="lorem-sideways-left" aria-selected="true">
                            Sources
                        </div>
                    </li>
                    <li className="nav-item" role="presentation">
                        <div id="sapien-sideways-left-tab" className="nav-link tab-clickable" role="tab" data-bs-toggle="tab" data-bs-target="#sapien-sideways-left" aria-controls="sapien-sideways-left" aria-selected="false">
                            Intersections
                        </div>
                    </li>
                    <li className="nav-item" role="presentation">
                        <div id="llanfairpwllgwyngyll-sideways-right-tab" className="nav-link tab-clickable" role="tab" data-bs-toggle="tab" data-bs-target="#llanfairpwllgwyngyll-sideways-left" aria-controls="llanfairpwllgwyngyll-sideways-right" aria-selected="false">
                            Datasets
                        </div>
                    </li>
                </ul>
                {/* <Nav className="sideways-tabs left-tabs">
                    <Nav.Item>
                        <Nav.Link href="#" active>Active</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#">Link</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#">Link</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#" disabled>Disabled</Nav.Link>
                    </Nav.Item>
                </Nav> */}
            </div>
        </div>
    );
};

export default SideBar;
