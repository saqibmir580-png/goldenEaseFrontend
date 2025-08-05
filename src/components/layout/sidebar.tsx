import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Settings, Grid, FileText, Users, User, Menu, LogOut, X } from "lucide-react";
import { CiUser } from "react-icons/ci";


interface SidebarProps {
  userEmail?: string;
  userRole?: string;
}


const Sidebar: React.FC<SidebarProps> = (props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileView, setMobileView] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Read user info from localStorage if not provided as props
  let userEmail = props.userEmail;
  let userRole = props.userRole;
  if (!userEmail || !userRole) {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userEmail = user.email;
        userRole = user.role;
      } catch {}
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setMobileView(true);
      } else {
        setMobileView(false);
        setMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (mobileView) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Show only Dashboard for admin, only Application Management for user
  const navItems = userRole === 'admin'
    ? [
        { name: "Dashboard", icon: <Grid size={18} />, path: "/dashboard" },
        { name: "Application Management", icon: <FileText size={18} />, path: "/application-management" },
      ]
    : [
        
        { name: "User Managment", icon: <Grid size={18} />, path: "/usermanagment" },
      ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.clear();
    navigate('/');
  };

  // Mobile menu overlay that appears from the side
  if (mobileView && mobileMenuOpen) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Dark overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Mobile menu */}
        <div className="relative w-64 max-w-[80%] bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col shadow-xl">
          <div className="p-4 flex items-center justify-between border-b border-blue-700/30">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">GoldenEase</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-blue-700/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center mb-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer
                ${isActive(item.path) ? 'bg-blue-700/30 text-white' : 'text-blue-200 hover:bg-blue-700/20 hover:text-white'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-blue-700/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                <User size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm">{userRole === 'admin' ? 'Admin User' : 'User'}</p>
                <p className="text-xs text-blue-300 truncate">{userEmail || 'user@GoldenEase.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-blue-200 hover:bg-blue-700/20 hover:text-white transition-colors"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span className="ml-3 text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main sidebar - hidden completely on mobile when closed, or collapsed to icon-only on desktop
  return (
    <>
      {/* Mobile hamburger button - fixed position */}
      {mobileView && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-blue-700 text-white shadow-lg hover:bg-blue-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}
      
      {/* Regular sidebar - hidden on mobile, collapsible on desktop */}
      <div
        className={`
          ${mobileView ? 'hidden' : 'flex'} 
          ${sidebarOpen ? "w-64" : "w-20"} 
          bg-gradient-to-b from-blue-800 to-blue-900 text-white 
          transition-all duration-300 ease-in-out flex-col
          shadow-xl h-screen sticky top-0
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-700/30">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">GoldenEase</h1>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CiUser size={24} />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg hover:bg-blue-700/20 transition-colors ${!sidebarOpen && 'mx-auto'}`}
          >
            <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center mb-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer
              ${isActive(item.path) ? 'bg-blue-700/30 text-white' : 'text-blue-200 hover:bg-blue-700/20 hover:text-white'}
              ${!sidebarOpen && 'justify-center'}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700/30 space-y-4">
          <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
              <User size={18} />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-medium text-sm">{userRole === 'admin' ? 'Admin User' : 'User'}</p>
                <p className="text-xs text-blue-300 truncate">{userEmail || 'user@GoldenEase.com'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-blue-200 hover:bg-blue-700/20 hover:text-white transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
