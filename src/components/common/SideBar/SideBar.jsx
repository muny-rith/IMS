import { NavLink } from 'react-router-dom'
import logo from '../../../assets/images/logo.png'
import './SideBar.css'

import SpaceDashboardIcon   from '@mui/icons-material/SpaceDashboard'
import ShoppingCartIcon      from '@mui/icons-material/ShoppingCart'
import TableRowsIcon         from '@mui/icons-material/TableRows'
import PaidIcon              from '@mui/icons-material/Paid'
import PersonIcon            from '@mui/icons-material/Person'
import InsertDriveFileIcon   from '@mui/icons-material/InsertDriveFile'

const navItems = [
  { to: '/dashboard', icon: <SpaceDashboardIcon />, label: 'Dashboard' },
  { to: '/products',   icon: <ShoppingCartIcon />,   label: 'Product'   },
  { to: '/categories',  icon: <TableRowsIcon />,       label: 'Category'  },
  { to: '/loans',      icon: <PaidIcon />,            label: 'Loan'      },
  { to: '/workers',    icon: <PersonIcon />,          label: 'Worker'    },
  { to: '/reports',    icon: <InsertDriveFileIcon />, label: 'Report'    },
]

const SideBar = ({ collapsed = false, isMobile = false, onClose }) => {
  return (
    <nav className={['sidebar', collapsed ? 'sidebar--collapsed' : ''].filter(Boolean).join(' ')}>

      <div className="sidebar__logo">
        <img src={logo} alt="Moon IMS" />
        <span className="sidebar__logo-text">Moon IMS</span>
      </div>

      <ul className="sidebar__nav">
        {navItems.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
              }
              onClick={() => isMobile && onClose?.()}
              title={collapsed ? label : undefined}
            >
              <span className="sidebar__icon">{icon}</span>
              <span className="sidebar__label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SideBar