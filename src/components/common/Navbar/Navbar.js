import './Navbar.css'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { useAuth } from '../../../features/auth/hooks/useAuth'

const getInitials = (email = '') => {
  const name = email.split('@')[0] || 'U'
  return name.slice(0, 2).toUpperCase()
}

// All state comes from MainLayout
const Navbar = ({ collapsed, isMobile, onMenuClick }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="navbar">
      <button className="navbar__toggle" onClick={onMenuClick} aria-label="Toggle sidebar">
        {/* on desktop: show open/close icon based on collapsed */}
        {/* on mobile: always hamburger */}
        {!isMobile && !collapsed
          ? <MenuOpenIcon />
          : <MenuIcon />
        }
      </button>

      <div className="navbar__right">
        <div className="navbar__user">
          <span className="navbar__avatar">{getInitials(user?.email)}</span>
          <span className="navbar__email">{user?.email}</span>
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
