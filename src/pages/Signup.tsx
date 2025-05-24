import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


const SignUp = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );
            const user = userCredential.user;

            // Save to Firestore after successful signup
            await setDoc(doc(db, 'users', user.uid), {
                name: form.name,
                email: form.email,
                createdAt: new Date(),
            });
            setMessage('✅ Account created for ' + userCredential.user.email);
        } catch (error) {
            setMessage('❌ ' + error.message);
            console.error('Error code:', error.code);
        }
    };

    return (
        <div style={styles.page}>
            {/* Top bar */}
            <div style={styles.navbar}>
                <h2 style={styles.brand}>Library</h2>
                <div style={styles.navLinks}>
                    <a href="/">Home</a>
                    <a href="/">Explore</a>
                    <a href="/">My Books</a>
                    <button style={styles.loginButton}>Log in</button>
                </div>
            </div>

            {/* Center form */}
            <div style={styles.formWrapper}>
                <h1 style={styles.heading}>Create your account</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label>Name</label>
                    <input type="text" name="name" value={form.name}  onChange={handleChange} placeholder="Enter your name" style={styles.input}/>

                    <label>Email</label>
                    <input type="email" name="email" value={form.email}  onChange={handleChange} placeholder="Enter your email" style={styles.input}/>

                    <label>Password</label>
                    <input type="password" name="password" value={form.password}  onChange={handleChange} placeholder="Enter your password" style={styles.input}/>

                    <button type="submit" style={styles.signUpButton}>Sign Up</button>

                    <div style={styles.orWrapper}>
                        <span>Or sign up with</span>
                    </div>

                    <button style={styles.googleButton}>
                        <span style={{marginRight: 8}}>🔍</span>
                        Sign up with Google
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: {
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
    },
    navbar: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #eee',
    },
    brand: {
        margin: 0,
        fontWeight: 'bold',
        fontSize: '22px',
    },
    navLinks: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    loginButton: {
        padding: '6px 16px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#f2f2f2',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    formWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '16px', // reduced from 48px
        width: '100%',
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        width: '540px',          // wider form
        maxWidth: '95vw',        // responsive for small screens
        padding: '32px',         // breathing space
        backgroundColor: '#fff', // optional white background for contrast
        borderRadius: '12px',    // rounded edges for polish
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // subtle shadow
    },
    heading: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '24px',
        marginTop: '0px', // remove any top margin
    },
    input: {
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        backgroundColor: '#f2f2f2',
        fontSize: '16px',
    },
    signUpButton: {
        backgroundColor: '#000',
        color: '#fff',
        padding: '12px',
        borderRadius: '24px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
    },
    orWrapper: {
        textAlign: 'center',
        color: '#777',
        fontSize: '14px',
    },
    googleButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        borderRadius: '24px',
        backgroundColor: '#eee',
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default SignUp;
