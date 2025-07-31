import './LoginPage.scss';
import { useNavigate } from "react-router-dom";
import { GoogleLoginButton, FacebookLoginButton, AppleLoginButton } from 'react-social-login-buttons';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setPortfolioData } from '../redux/userSlice';

const LoginPage = () => {
    const nav = useNavigate();
    const dispatch = useDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetch('https://backend-1383.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.user?.username) {
                dispatch(setUser(data.user));

                // ✅ 存入 cookie
                const expires = new Date();
                expires.setDate(expires.getDate() + 7);
                document.cookie = `userId=${data.user.id}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

                // 获取投资组合数据
                const portfolioRes = await fetch(`https://backend-1383.onrender.com/api/portfolios/user/${data.user.id}`);
                const portfolios = await portfolioRes.json();
                dispatch(setPortfolioData(portfolios));

                alert('You have logged in successfully');
                nav('/');
            } else {
                alert('Please input right username and password');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Something went wrong');
        }
    };

    return (
        <div className='LoginPage'>
            <div className="LoginPanel">
                <div className="h3">Log in to your account</div>
                <div className="loginInput">
                    <input
                        placeholder={'User Name'}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="loginInput">
                    <input
                        placeholder={'Password'}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button onClick={handleLogin} className='confirmBtn'>
                    Log in
                </button>
                <h5>or</h5>
                <GoogleLoginButton style={{ width: '80%', height: '7%' }} onClick={() => nav('/')} />
                <FacebookLoginButton style={{ width: '80%', height: '7%' }} onClick={() => nav('/')} />
                <AppleLoginButton style={{ width: '80%', height: '7%' }} onClick={() => nav('/')} />
            </div>
        </div>
    );
};

export default LoginPage;
