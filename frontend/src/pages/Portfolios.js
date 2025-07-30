import PieChart from "../components/PieChart";
import './portfolios.scss';
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Portfolios = () => {
    const nav = useNavigate();

    // 示例数据（伪造）
    const fakePieData = [
        [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 274, name: 'Ads' },
            { value: 235, name: 'Video' },
            { value: 400, name: 'Search' }
        ],
        [
            { value: 500, name: 'AAPL' },
            { value: 200, name: 'TSLA' },
            { value: 100, name: 'NVDA' },
            { value: 80, name: 'AMZN' },
            { value: 300, name: 'GOOG' }
        ],
        [
            { value: 350, name: 'Bank' },
            { value: 150, name: 'Energy' },
            { value: 250, name: 'Real Estate' },
            { value: 100, name: 'Tech' },
            { value: 500, name: 'Healthcare' }
        ]
    ];

    return (
        <div className="portfolios">
            <Header />

            <div className='portfoliosBody'>
                <div className="part1">
                    <div className="button">Overview of All portfolios</div>
                    <div className="button">Create New Portfolio</div>
                </div>

                <div className="part2">
                    <div className="diagram">
                        {fakePieData.map((d, i) => (
                            <PieChart key={i} title={`Portfolio ${i + 1}`} data={d} />
                        ))}
                    </div>
                </div>

                <div className="part3">
                    <div className="portTitle">
                        <div className="leftTitle">
                            <div className="myPortBtn">My Portfolios</div>
                            <div className="myPortBtn">My Holdings</div>
                        </div>
                        <div className="rightTitle">
                            How to Utilize My Portfolio and My Holdings
                        </div>
                    </div>

                    <div className="portBody">
                        <div className="namepart"><h3>NAME</h3></div>
                        <div className="infopart">
                            <h3>symbols</h3>
                            <h3>cost</h3>
                            <h3>mktval</h3>
                            <h3>daychange</h3>
                            <h3>unreal</h3>
                            <h3>realize</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolios;