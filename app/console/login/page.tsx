// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { postRequest } from '@/lib/request';
import { useRouter } from 'next/navigation';
import { useFeedback } from '@/context/FeedbackContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const router = useRouter();

    const { showLoading, showToast, hideLoading } = useFeedback();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        showLoading();
        postRequest('/api/admin/login', { username, password }).then(data => {
            router.push('/console');
        }).catch(err => {
            console.log(err);
            showToast(err.message);
            hideLoading();
        });
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={styles.title}>登录</h2>
                <input
                    type='text'
                    placeholder='账号'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
                <input
                    type='password'
                    placeholder='密码'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <button type='submit' style={styles.button}>
                    登录
                </button>
            </form>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
    },
    form: {
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default LoginPage;
