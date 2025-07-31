import "./header.scss";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
    const nav = useNavigate();
    const user = useSelector((state) => state.userData.user);
    const isLoggedIn = !!user?.username;

    const goToGitHub = () => {
        window.open('https://github.com/AlvisWhy/MoneyMint', '_blank');
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '';
    };

    return (
        <div className="header">
            <div className="leftLogo">
                <img src="/favicon.ico" alt=""/>
            </div>
            {isLoggedIn ? (
                <>
                    <h3 onClick={() => nav('/')}>MAIN</h3>
                    <h3 onClick={() => nav('/portfolios')}>PORTFOLIO</h3>
                    <h3 onClick={goToGitHub}>ABOUT</h3>
                    <div className="user-circle">
                        {getInitial(user.username)}
                    </div>
                </>
            ) : (
                <>
                    <h3 onClick={() => nav('/')}>MAIN</h3>
                    <h3 onClick={goToGitHub}>ABOUT</h3>
                    <h3 onClick={() => nav('/login')}>LOG IN</h3>
                </>
            )}
        </div>
    );
};

export default Header;
