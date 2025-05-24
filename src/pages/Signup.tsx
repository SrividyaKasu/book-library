import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { FormEvent, ChangeEvent } from 'react';
import type { CSSProperties } from 'react';

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
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
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
    };

    const navbar: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #eee',
    };

    const brand: CSSProperties = {
        margin: 0,
        fontWeight: 'bold',
        fontSize: '22px',
    };

    const navLinks: CSSProperties = {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    };

    const loginButton: CSSProperties = {
        padding: '6px 16px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#f2f2f2',
        cursor: 'pointer',
        fontWeight: 'bold',
    };

    const formWrapper: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '32px',
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

    const signUpButton: CSSProperties = {
        backgroundColor: '#000',
        color: '#fff',
        padding: '12px',
        borderRadius: '24px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
    };

    const orWrapper: CSSProperties = {
        textAlign: 'center',
        color: '#777',
        fontSize: '14px',
    };

    const googleButton: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        borderRadius: '24px',
        backgroundColor: '#eee',
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
    };

    return (
        <div style={page}>
            <div style={navbar}>
                <h2 style={brand}>Library</h2>
                <div style={navLinks}>
                    <a href="/">Home</a>
                    <a href="/">Explore</a>
                    <a href="/">My Books</a>
                    <button style={loginButton}>Log in</button>
                </div>
            </div>
            <div style={formWrapper}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h1 style={heading}>Create your account</h1>

                    <label>Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" style={input} />

                    <label>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" style={input} />

                    <label>Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" style={input} />

                    <button type="submit" style={signUpButton}>Sign Up</button>

                    <div style={orWrapper}>
                        <span>Or sign up with</span>
                    </div>

                    <button type="button" style={googleButton}>
                        <span style={{ marginRight: 8 }}>🔍</span>
                        Sign up with Google
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
