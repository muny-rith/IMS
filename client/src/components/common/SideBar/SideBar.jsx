import React, { useState, useEffect, Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

const navSections = [
  {
    title: 'Overview',
    icon: <SpaceDashboardIcon />,
    items: [
      { to: '/dashboard', icon: <SpaceDashboardIcon />, label: 'Dashboard' },
    ]
  },
  {
    title: 'Catalog',
    icon: <StyleIcon />,
    items: [
      { to: '/products',   icon: <ShoppingCartIcon />,   label: 'Product'   },
      { to: '/categories',  icon: <TableRowsIcon />,     label: 'Category'  },
      { to: '/brands',      icon: <LocalOfferIcon />,    label: 'Brand'     },
      { to: '/attributes', icon: <StyleIcon />,          label: 'Attribute' },
    ]
  },
  {
    title: 'Inventory',
    icon: <Inventory2Icon />,
    items: [
      { to: '/stocks',    icon: <Inventory2Icon />,      label: 'Stock'     },
      { to: '/loans',      icon: <PaidIcon />,           label: 'Loan'      },
      { to: '/stock-issues', icon: <OutputIcon />,       label: 'Issue'     },
    ]
  },
  {
    title: 'Sales',
    icon: <PointOfSaleIcon />,
    items: [
      { to: '/sales',      icon: <PointOfSaleIcon />,    label: 'Sales'     },
      { to: '/purchase-requests', icon: <AssignmentIcon />, label: 'Request' },
    ]
  },
  {
    title: 'People & Reports',
    icon: <PersonIcon />,
    items: [
      { to: '/workers',    icon: <PersonIcon />,         label: 'Worker'    },
      { to: '/reports',    icon: <InsertDriveFileIcon />, label: 'Report'   },
    ]
  }
]

const SidebarGroup = ({ section, isMobile, onClose }) => {
  const location = useLocation()
  const isActiveGroup = section.items.some(item => location.pathname.startsWith(item.to))
  const [isOpen, setIsOpen] = useState(isActiveGroup)

  useEffect(() => {
    if (isActiveGroup && !isOpen) {
      setIsOpen(true)
    }
  }, [location.pathname, isActiveGroup])

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
  return (
    <nav className={['sidebar', collapsed ? 'sidebar--collapsed' : ''].filter(Boolean).join(' ')}>

      <div className="sidebar__logo">
        <img src={logo} alt="Moon IMS" />
        <span className="sidebar__logo-text">Moon IMS</span>
      </div>

      <div className="sidebar__nav">
        {!collapsed && <div className="sidebar__menu-label">Menu</div>}
        
        {navSections.map((section, idx) => (
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