
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Settings, Search, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import pb from '@/lib/pocketbaseClient.js';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { 
      name: 'Area Guides', 
      type: 'dropdown',
      items: [
        { name: 'Greater Noida', path: '/area-guide/greater-noida' },
        { name: 'Noida', path: '/area-guide/noida' },
        { name: 'YEIDA', path: '/area-guide/yeida' }
      ]
    },
    { name: 'Invest', path: '/invest' },
    { name: 'Projects', path: '/projects' },
    { name: 'Fast Track', path: '/fast-track' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-border/50' : 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-border/20'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24 gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center justify-center group shrink-0" aria-label="Growperty Home">
            <img 
              src="https://horizons-cdn.hostinger.com/fbece560-2b4f-4b3e-ad4b-d7f3fff8f8d0/a2af0fdc5a8a26c29faace6e97444834.png" 
              alt="Growperty" 
              className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-[8px] md:text-[9px] font-bold text-primary tracking-widest text-center mt-1 uppercase hidden sm:block">
              GREATER NOIDA • NOIDA • YEIDA
            </span>
          </Link>

          {/* Desktop Nav - 11 items horizontal */}
          <nav className="hidden xl:flex items-center justify-center flex-1 gap-x-3 lg:gap-x-4 xl:gap-x-5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              if (link.type === 'dropdown') {
                const isActive = link.items.some(item => location.pathname === item.path);
                return (
                  <div 
                    key={link.name} 
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(link.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button 
                      className={`flex items-center gap-1 text-[13px] font-bold transition-all py-2 hover:text-[#10B981] ${isActive ? 'text-[#10B981]' : 'text-slate-700 dark:text-slate-300'}`}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === link.name}
                    >
                      {link.name}
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 z-50 ${activeDropdown === link.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible 10'}`}>
                      <div className="bg-white dark:bg-slate-900 border border-border shadow-xl rounded-xl p-2 min-w-[200px] flex flex-col gap-1 relative before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-white dark:before:border-b-slate-900">
                        {link.items.map((subItem) => (
                          <Link 
                            key={subItem.path} 
                            to={subItem.path} 
                            className={`px-4 py-2.5 text-[13px] font-bold rounded-lg transition-colors flex items-center ${location.pathname === subItem.path ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#10B981]'}`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[13px] font-bold transition-all py-2 hover:text-[#10B981] ${location.pathname === link.path ? 'text-[#10B981]' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={() => navigate('/post-requirement')} className="font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all text-xs h-9 px-3 active:scale-[0.98]">
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Req
            </Button>
            <Button onClick={() => navigate('/list-property')} className="bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold rounded-xl shadow-md transition-all text-xs h-9 px-3 active:scale-[0.98]">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Sell
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2">
                    <Avatar className="h-9 w-9 border-2 border-primary/10 hover:border-[#10B981]/50 transition-colors">
                      <AvatarImage src={currentUser?.avatar ? pb.files.getUrl(currentUser, currentUser.avatar) : ''} alt={currentUser?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-bold text-sm text-primary">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer font-medium">
                    <Link to={currentUser?.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer font-medium">
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-bold text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => navigate('/login')} className="font-bold rounded-xl ml-1 hover:bg-[#10B981]/10 hover:text-[#10B981] text-xs h-9 px-3">
                Log In
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="xl:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen} className="text-primary hover:bg-[#10B981]/10 hover:text-[#10B981]">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Vertical Dropdown) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-950 border-t border-border shadow-xl absolute w-full max-h-[calc(100vh-5rem)] overflow-y-auto pb-6">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              if (link.type === 'dropdown') {
                const isDropdownOpen = activeDropdown === link.name;
                return (
                  <div key={link.name} className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-2 last:border-0">
                    <button 
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : link.name)}
                      className="flex items-center justify-between px-3 py-3 w-full text-left font-bold text-[15px] text-slate-800 dark:text-slate-200 hover:text-[#10B981] transition-colors"
                    >
                      {link.name}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#10B981]' : ''}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${isDropdownOpen ? 'max-h-[300px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col pl-4 border-l-2 border-[#10B981]/30 ml-4 gap-1">
                        {link.items.map((subItem) => (
                          <Link 
                            key={subItem.path} 
                            to={subItem.path} 
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${location.pathname === subItem.path ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-[#10B981]'}`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-xl text-[15px] font-bold transition-colors ${location.pathname === link.path ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-[#10B981]'}`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* Mobile Action Buttons */}
            <div className="pt-6 mt-4 border-t border-border flex flex-col gap-3">
              <Button variant="outline" onClick={() => { navigate('/post-requirement'); setMobileMenuOpen(false); }} className="w-full font-bold rounded-xl justify-center border-primary/20 text-primary h-12 hover:bg-primary/5 hover:text-primary">
                <Search className="mr-2 h-5 w-5" />
                Add Requirement
              </Button>
              <Button onClick={() => { navigate('/list-property'); setMobileMenuOpen(false); }} className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold rounded-xl justify-center h-12 shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" />
                Sell Property
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button variant="secondary" onClick={() => { navigate(currentUser?.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'); setMobileMenuOpen(false); }} className="w-full font-bold rounded-xl justify-center h-12">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full font-bold rounded-xl justify-center text-destructive hover:text-destructive hover:bg-destructive/10 h-12">
                    <LogOut className="mr-2 h-5 w-5" />
                    Log Out
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full font-bold rounded-xl justify-center h-12 bg-slate-100 hover:bg-slate-200 text-primary">
                  Log In / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
