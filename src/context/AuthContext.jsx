import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(Cookies.get('token') || null);
    const [loading, setLoading] = useState(true);

    // Set default axios header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/auth/profile');
                setUser(res.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                logout();
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        Cookies.set('token', res.data.token, { expires: 7 });
        setToken(res.data.token);
        setUser(res.data);
    };

    const register = async (name, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        Cookies.set('token', res.data.token, { expires: 7 });
        setToken(res.data.token);
        setUser(res.data);
    };

    const logout = () => {
        Cookies.remove('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
