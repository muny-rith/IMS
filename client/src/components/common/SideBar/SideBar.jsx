import React, { useState, useEffect, Fragment, useMemo } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { getHomeRouteByRole } from '../../../constants/routes'
import logo from '../../../assets/images/logo.png'
import './SideBar.css'

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import TableRowsIcon from '@mui/icons-material/TableRows'
import PaidIcon from '@mui/icons-material/Paid'
import PersonIcon from '@mui/icons-material/Person'
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import StyleIcon from '@mui/icons-material/Style';
import OutputIcon from '@mui/icons-material/Output';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { useAuth } from '../../../features/auth/hooks/useAuth'

const navSections = [
  {
    title: 'Overview',
    icon: <SpaceDashboardIcon />,
    roles: ['admin', 'manager'],
    items: [
      { to: '/dashboard', icon: <SpaceDashboardIcon />, label: 'Dashboard', roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Catalog',
    icon: <StyleIcon />,
    roles: ['admin', 'manager', 'staff', 'worker'],
    items: [
      { to: '/products',   icon: <ShoppingCartIcon />,   label: 'Product',   roles: ['admin', 'manager', 'staff', 'worker'] },
      { to: '/categories',  icon: <TableRowsIcon />,     label: 'Category',  roles: ['admin', 'manager'] },
      { to: '/brands',      icon: <LocalOfferIcon />,    label: 'Brand',     roles: ['admin', 'manager'] },
      { to: '/attributes', icon: <StyleIcon />,          label: 'Attribute', roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Inventory',
    icon: <Inventory2Icon />,
    roles: ['admin', 'manager', 'staff'],
    items: [
      { to: '/stocks',    icon: <Inventory2Icon />,      label: 'Stock',     roles: ['admin', 'manager'] },
      { to: '/loans',      icon: <PaidIcon />,           label: 'Loan',      roles: ['admin', 'manager', 'staff'] },
      { to: '/stock-issues', icon: <OutputIcon />,       label: 'Issue',     roles: ['admin', 'manager', 'staff'] },
    ]
  },
  {
    title: 'Sales',
    icon: <PointOfSaleIcon />,
    roles: ['admin', 'manager', 'staff'],
    items: [
      { to: '/sales',      icon: <PointOfSaleIcon />,    label: 'Sales',   roles: ['admin', 'manager', 'staff'] },
      { to: '/purchase-requests', icon: <AssignmentIcon />, label: 'Request', roles: ['admin', 'manager', 'staff'] },
    ]
  },
  {
    title: 'Reports',
    icon: <InsertDriveFileIcon />,
    roles: ['admin', 'manager', 'staff'],
    items: [
      { to: '/reports',    icon: <InsertDriveFileIcon />, label: 'Report', roles: ['admin', 'manager', 'staff'] },
    ]
  },
  {
    title: 'People',
    icon: <PersonIcon />,
    roles: ['admin', 'manager'],
    items: [
      { to: '/workers',    icon: <PersonIcon />,         label: 'Worker',  roles: ['admin', 'manager'] },
    ]
  }
]

export const getVisibleNavSections = (userRole = 'staff') => {
  return navSections
    .map((section) => {
      const items = section.items.filter(
        (item) => !item.roles || item.roles.includes(userRole)
      );
      return { ...section, items };
    })
    .filter(
      (section) =>
        section.items.length > 0 &&
        (!section.roles || section.roles.includes(userRole))
    );
};

export const getTotalVisibleNavCount = (userRole = 'staff') => {
  const sections = getVisibleNavSections(userRole);
  return sections.reduce((total, s) => total + s.items.length, 0);
};

const SidebarGroup = ({ section, isMobile, onClose }) => {
  const location = useLocation()
  const isActiveGroup = section.items.some(item => location.pathname.startsWith(item.to))
  const [isOpen, setIsOpen] = useState(isActiveGroup)

  useEffect(() => {
    if (isActiveGroup) {
      setIsOpen(true)
    }
  }, [isActiveGroup])

  return (
    <div className="sidebar__group">
      <div
        className={`sidebar__group-header ${isActiveGroup ? 'sidebar__group-header--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="sidebar__group-title">
          <span className="sidebar__icon">{section.icon}</span>
          <span className="sidebar__label">{section.title}</span>
        </div>
        <span className="sidebar__chevron">
          {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </span>
      </div>

      {isOpen && (
        <ul className="sidebar__group-items">
          {section.items.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  'sidebar__sublink' + (isActive ? ' sidebar__sublink--active' : '')
                }
                onClick={() => isMobile && onClose?.()}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const SideBar = ({ collapsed = false, isMobile = false, onClose }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'staff';
  const homePath = getHomeRouteByRole(userRole);

  const visibleSections = useMemo(() => {
    return getVisibleNavSections(userRole);
  }, [userRole]);

  return (
    <nav className={['sidebar', collapsed ? 'sidebar--collapsed' : ''].filter(Boolean).join(' ')}>

      <Link
        to={homePath}
        className="sidebar__logo"
        onClick={() => isMobile && onClose?.()}
        title="Go to Home"
      >
        <img src={logo} alt="Moon IMS" />
        <span className="sidebar__logo-text">Moon IMS</span>
      </Link>

      <div className="sidebar__nav">
        {!collapsed && <div className="sidebar__menu-label">Menu</div>}
        
        {visibleSections.map((section, idx) => (
          <Fragment key={idx}>
            {/* When expanded, show accordion group */}
            {!collapsed && (
              <SidebarGroup
                section={section}
                isMobile={isMobile}
                onClose={onClose}
              />
            )}

            {/* When collapsed, show all features as flat icons */}
            {collapsed && (
              <>
                {idx !== 0 && <div className="sidebar__group-divider"></div>}
                <ul className="sidebar__group-items--collapsed">
                  {section.items.map(({ to, icon, label }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                        }
                        onClick={() => isMobile && onClose?.()}
                        title={label}
                      >
                        <span className="sidebar__icon">{icon}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  )
}

export default SideBar