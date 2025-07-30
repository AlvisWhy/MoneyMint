import './LoginPage.scss'
import {useNavigate} from "react-router-dom";
import { GoogleLoginButton, FacebookLoginButton, AppleLoginButton } from 'react-social-login-buttons';
const LoginPage = ()=> {
    const nav = useNavigate();

    return <div className='LoginPage'>
        <div className="LoginPanel">
            <div className="h3">
                Log in to your account
            </div>
            <div className="loginInput">
                <input placeholder={'Email address'} type="text"/>
            </div>
            <div className="loginInput">
                <input placeholder={'Password'} type="text"/>
            </div>
            <button onClick={()=>{nav('/')}} className='confirmBtn'>
                Log in
            </button>
            <h5>or</h5>
            <GoogleLoginButton style={{ width: '80%', height:'7%' }} onClick={() => {nav('/')}} />
            <FacebookLoginButton style={{ width: '80%', height:'7%' }} onClick={() => {nav('/')}} />
            <AppleLoginButton style={{ width: '80%', height:'7%' }} onClick={() => {nav('/')}} />
        </div>
    </div>
}

export default LoginPage;