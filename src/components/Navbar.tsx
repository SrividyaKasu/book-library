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
        padding: '12px 24px',
        borderBottom: '1px solid #eee',
        height: '56px',
        backgroundColor: 'white',
    };

    const brand: CSSProperties = {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '20px',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: '#000',
    };

    const logoIcon: CSSProperties = {
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        justifyContent: 'center',
    };

    const navLinks: CSSProperties = {
        marginLeft: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
    };

    const navLink: CSSProperties = {
        padding: '6px 12px',
        textDecoration: 'none',
        color: '#64748b',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
    };

    const activeNavLink: CSSProperties = {
        ...navLink,
        backgroundColor: '#f1f5f9',
        color: '#2563eb',
        fontWeight: '600',
    };

    const profileContainer: CSSProperties = {
        position: 'relative',
    };

    const profileIcon: CSSProperties = {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '16px',
        color: 'white',
        fontWeight: 'bold',
        transition: 'transform 0.2s ease',
        transform: isDropdownOpen ? 'scale(1.1)' : 'scale(1)',
    };

    const dropdownMenu: CSSProperties = {
        position: 'absolute',
        top: '120%',
        right: 0,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        minWidth: '240px',
        display: isDropdownOpen ? 'block' : 'none',
        zIndex: 1000,
    };

    const userInfo: CSSProperties = {
        marginBottom: '16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
    };

    const userName: CSSProperties = {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '4px',
        color: '#1e293b',
    };

    const userEmail: CSSProperties = {
        fontSize: '14px',
        color: '#64748b',
        wordBreak: 'break-all',
    };

    const logoutButton: CSSProperties = {
        width: 'auto',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'opacity 0.2s ease',
        margin: '0 auto',
    };

    const divider: CSSProperties = {
        height: '1px',
        backgroundColor: '#e2e8f0',
        margin: '16px 0',
    };

    return (
        <div style={navbar}>
            <a href="/" style={brand}>
                <div style={logoIcon}>📚</div>
                <span>Library</span>
            </a>
            {user && (
                <div style={navLinks}>
                    <a 
                        href="/" 
                        style={location.pathname === '/' ? activeNavLink : navLink}
                        onMouseOver={e => {
                            if (location.pathname !== '/') {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#3b82f6';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                            }
                        }}
                    >
                        🏠 Home
                    </a>
                    <a 
                        href="/explore" 
                        style={location.pathname === '/explore' ? activeNavLink : navLink}
                        onMouseOver={e => {
                            if (location.pathname !== '/explore') {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#3b82f6';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/explore') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                            }
                        }}
                    >
                        🔍 Explore
                    </a>
                    <a 
                        href="/my-books" 
                        style={location.pathname === '/my-books' ? activeNavLink : navLink}
                        onMouseOver={e => {
                            if (location.pathname !== '/my-books') {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#3b82f6';
                            }
                        }}
                        onMouseOut={e => {
                            if (location.pathname !== '/my-books') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                            }
                        }}
                    >
                        📚 My Books
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
                            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                        >
                            <span style={{ fontSize: '14px' }}>👋</span>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar; 