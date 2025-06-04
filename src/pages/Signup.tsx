import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { FormEvent, ChangeEvent } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
    name: string;
    email: string;
    createdAt: Date;
}

const userConverter = {
    toFirestore(user: UserData) {
        return user;
    },
    fromFirestore(snapshot: any): UserData {
        const data = snapshot.data();
        return {
            name: data.name,
            email: data.email,
            createdAt: data.createdAt.toDate?.() ?? new Date(),
        };
    }
};

const Signup = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        
        try {
            if (isSignIn) {
                const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
                setMessage(`✅ Welcome back, ${userCredential.user.email}!`);
                navigate('/my-books');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
                const user = userCredential.user;

                const userData: UserData = {
                    name: form.name,
                    email: form.email,
                    createdAt: new Date(),
                };

                const userDoc = doc(db, 'users', user.uid).withConverter(userConverter);
                await setDoc(userDoc, userData);

                setMessage(`✅ Account created for ${user.email}`);
                navigate('/my-books');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message);
                setMessage(`❌ ${error.message}`);
            } else {
                setMessage('❌ Unknown error');
            }
        }
    };

    const page: CSSProperties = {
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    const logoWrapper: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '48px',
        marginBottom: '32px',
    };

    const logoIcon: CSSProperties = {
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        justifyContent: 'center',
    };

    const logoText: CSSProperties = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#000',
        margin: 0,
    };

    const formWrapper: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    };

    const formStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    };

    const heading: CSSProperties = {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '16px',
        textAlign: 'center',
    };

    const input: CSSProperties = {
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        backgroundColor: '#f2f2f2',
        fontSize: '16px',
    };

    const submitButton: CSSProperties = {
        backgroundColor: '#000',
        color: '#fff',
        padding: '12px',
        borderRadius: '24px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
    };

    const toggleButton: CSSProperties = {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '8px',
        textAlign: 'center',
    };

    const messageStyle: CSSProperties = {
        textAlign: 'center',
        marginTop: '12px',
        fontSize: '14px',
        color: '#444',
    };

    return (
        <div style={page}>
            <div style={logoWrapper}>
                <div style={logoIcon}>📚</div>
                <h1 style={logoText}>Library</h1>
            </div>
            <div style={formWrapper}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h1 style={heading}>{isSignIn ? 'Welcome Back' : 'Create your account'}</h1>

                    {!isSignIn && (
                        <>
                            <label>Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={form.name} 
                                onChange={handleChange} 
                                placeholder="Enter your name" 
                                style={input}
                                required={!isSignIn}
                            />
                        </>
                    )}

                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        placeholder="Enter your email" 
                        style={input}
                        required
                    />

                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        placeholder="Enter your password" 
                        style={input}
                        required
                    />

                    <button type="submit" style={submitButton}>
                        {isSignIn ? 'Sign In' : 'Sign Up'}
                    </button>

                    <button 
                        type="button" 
                        style={toggleButton}
                        onClick={() => {
                            setIsSignIn(!isSignIn);
                            setMessage('');
                            setForm({ name: '', email: '', password: '' });
                        }}
                    >
                        {isSignIn 
                            ? "Don't have an account? Sign Up" 
                            : "Already have an account? Sign In"}
                    </button>

                    {message && <div style={messageStyle}>{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default Signup;
