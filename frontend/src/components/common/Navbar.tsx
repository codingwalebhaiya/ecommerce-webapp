import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Home, Package, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const getInitials = (name?: string, username?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (username) return username.charAt(0).toUpperCase();
    return "U";
  };

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: Package },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ShopLogo
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // User Menu for Desktop
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(user?.name, user?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Login/Register buttons for Desktop
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile User Info */}
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3 p-4 border-b">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user?.name, user?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user?.name || user?.username}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-b">
                      <p className="text-sm text-gray-500 mb-3">Welcome! Please login or register</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            navigate("/login");
                            setIsOpen(false);
                          }}
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            navigate("/register");
                            setIsOpen(false);
                          }}
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 py-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Footer Actions */}
                  {isAuthenticated && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors w-full"
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;