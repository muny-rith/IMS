import React from 'react'
import './Navbar.css'
import logo from '../../../assets/images/logo.png'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { useAuth } from '../../../features/auth/hooks/useAuth'

const getInitials = (email = '') => {
  const name = email.split('@')[0] || 'U'
  return name.slice(0, 2).toUpperCase()
}

// All state comes from MainLayout
const Navbar = ({ collapsed, isMobile, hasSidebar = true, onMenuClick }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="navbar">
      {hasSidebar ? (
        <button className="navbar__toggle" onClick={onMenuClick} aria-label="Toggle sidebar">
          {/* on desktop: show open/close icon based on collapsed */}
          {/* on mobile: always hamburger */}
          {!isMobile && !collapsed
            ? <MenuOpenIcon />
            : <MenuIcon />
          }
        </button>
      ) : (
        <div className="navbar__brand">
          <img src={logo} alt="Moon IMS" className="navbar__brand-logo" />
          <span className="navbar__brand-text">Moon IMS</span>
        </div>
      )}

      <div className="navbar__right">
        <div className="navbar__user">
          <span className="navbar__avatar">{getInitials(user?.email)}</span>
          <div className="navbar__user-info">
            <span className="navbar__email">{user?.name || user?.email}</span>
            <span className={`navbar__role-badge navbar__role-badge--${user?.role || 'staff'}`}>
              {user?.role || 'staff'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="navbar__logout"
          onClick={handleSignOut}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogoutIcon fontSize="small" />
        </button>
      </div>
    </header>
  )
}

export default Navbar

