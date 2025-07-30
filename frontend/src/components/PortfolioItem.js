import "./portfolioItem.scss"
const PortfolioItem= ({name, symbols,cost,mktval,daychange,unreal,realize}) => {
    return <div className='portItem'>
        <div className="namepart">
            <h3>{name}</h3>
        </div>
        <div className="infopart">
            <h3>{symbols}</h3>
            <h3>{cost}</h3>
            <h3>{mktval}</h3>
            <h3>{daychange}</h3>
            <h3>{unreal}</h3>
            <h3>{realize}</h3>
        </div>
    </div>
}

export default PortfolioItem