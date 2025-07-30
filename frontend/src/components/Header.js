import "./header.scss";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const nav = useNavigate();
    return (
        <div className='header'>
            <h3>USER</h3>
            <h3>CONTACT</h3>
            <h3>ABOUT</h3>
            <h3 onClick={() => nav('/login')}>LOG IN</h3>
        </div>
    );
};

export default Header;