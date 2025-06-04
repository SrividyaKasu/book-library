import type { CSSProperties } from 'react';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';

interface UserData {
    name: string;
    email: string;
    createdAt: Date;
}

const Navbar = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const userDoc = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                }
            } else {
                setUserData(null);
                if (location.pathname !== '/') {
                    navigate('/');
                }
            }
        });
        return () => unsubscribe();
    }, [location.pathname, navigate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsDropdownOpen(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navbar: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 32px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '64px',
    };

    const brand: CSSProperties = {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '24px',
        fontWeight: '800',
        textDecoration: 'none',
        color: '#1a1a1a',
        letterSpacing: '-0.5px',
    };

    const logoIcon: CSSProperties = {
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.25)',
    };

    const navLinks: CSSProperties = {
        marginLeft: '48px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
    };

    const navLink: CSSProperties = {
        padding: '8px 16px',
        textDecoration: 'none',
        color: '#666',
        fontSize: '15px',
        fontWeight: '500',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    const activeNavLink: CSSProperties = {
        ...navLink,
        backgroundColor: '#fff',
        color: '#FF6B6B',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    };

    const profileContainer: CSSProperties = {
        position: 'relative',
    };

    const profileIcon: CSSProperties = {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '16px',
        color: 'white',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        transform: isDropdownOpen ? 'scale(1.05)' : 'scale(1)',
        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.25)',
    };

    const dropdownMenu: CSSProperties = {
        position: 'absolute',
        top: '120%',
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        padding: '20px',
        minWidth: '280px',
        display: isDropdownOpen ? 'block' : 'none',
        zIndex: 1000,
        border: '1px solid rgba(0, 0, 0, 0.05)',
    };

    const userInfo: CSSProperties = {
        marginBottom: '20px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    };

    const userName: CSSProperties = {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '4px',
        color: '#1a1a1a',
        letterSpacing: '-0.3px',
    };

    const userEmail: CSSProperties = {
        fontSize: '14px',
        color: '#666',
        wordBreak: 'break-all',
    };

    const logoutButton: CSSProperties = {
        width: '100%',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.25)',
    };

    const divider: CSSProperties = {
        height: '1px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        margin: '20px 0',
    };

    return (
        <div style={navbar}>
            <a href="/my-books" style={brand}>
                <div style={logoIcon}>📚</div>
                <span>Bookshelf</span>
            </a>
            {user && (
                <div style={navLinks}>
                    <a 
                        href="/my-books" 
                        style={location.pathname === '/my-books' ? activeNavLink : navLink}
                        onMouseOver={e => {
                            if (location.pathname !== '/my-books') {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                e.currentTarget.style.color = '#FF6B6B';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/my-books') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#666';
                            }
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>📚</span>
                        My Books
                    </a>
                    <a 
                        href="/borrowed" 
                        style={location.pathname === '/borrowed' ? activeNavLink : navLink}
                        onMouseOver={e => {
                            if (location.pathname !== '/borrowed') {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                e.currentTarget.style.color = '#FF6B6B';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/borrowed') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#666';
                            }
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>📅</span>
                        Borrowed Books
                    </a>
                </div>
            )}
            {user && (
                <div style={profileContainer} ref={dropdownRef}>
                    <div 
                        style={profileIcon}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        title="Click to open menu"
                    >
                        {userData?.name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
                    </div>
                    <div style={dropdownMenu}>
                        <div style={userInfo}>
                            <div style={userName}>{userData?.name || 'User'}</div>
                            <div style={userEmail}>{user.email}</div>
                        </div>
                        <div style={divider} />
                        <button 
                            style={logoutButton} 
                            onClick={handleLogout}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.25)';
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>👋</span>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar; 