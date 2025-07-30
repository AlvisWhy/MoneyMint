import "./overallIndex.scss";

const OverallIndex = ({ title, sp, val, perVal }) => {
    return (
        <div className="overallIndex">
            <div className="upper">
                <h4 className="title">{title}</h4>
                <h4>{sp}</h4>
            </div>
            <hr
                style={{
                    border: 'none',
                    borderTop: '1px dashed #a2a2a2',
                    width: '100%',
                    margin: '5px 0',
                    color: '#27723e',
                }}
            />
            <div className="lower">
                <h4>{val}</h4>
                <h4>{perVal}</h4>
            </div>
        </div>
    );
};

export default OverallIndex;
