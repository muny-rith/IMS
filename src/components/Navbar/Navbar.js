import './Navbar.css'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'

// All state comes from MainLayout
const Navbar = ({ collapsed, isMobile, onMenuClick }) => {
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
        {/* Add notifications, avatar, etc. here */}
        <div className="navbar__avatar">TM</div>
      </div>
    </header>
  )
}

export default Navbar