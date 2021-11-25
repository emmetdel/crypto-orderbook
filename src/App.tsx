import React, {useEffect, useState} from "react";
import ToggleFeedBtn from "components/ToggleFeedBtn/toggle-feed-button.component";
import Api, {ProductID, WSResponse} from "./data/Api";
import OrderBookProcessor, {OrderBookEntry} from "./utils/order-processing";

// styles
import "./styles/index.scss";

const App: React.FC = () => {
    const [processedData, setProcessedData] = useState<[OrderBookEntry[], OrderBookEntry[]]>();
    const processor = new OrderBookProcessor();
    const api = new Api(ProductID.Bitcoin, (data: WSResponse) => {
        const dataArr = processor.processData(data);
        setProcessedData(dataArr);
        console.debug(processedData);
    });

    useEffect(() => {
        api.connect();
    });

    const toggleCallback = () => {
        const newProductID =
            api.productID === ProductID.Bitcoin ? ProductID.Ethereum : ProductID.Bitcoin;

        api.switchProduct(newProductID);
    };

    return (
        <>
            <div className="container">
                <header id="header">
                    <h1>Order Book</h1>
                    {/* TODO: add spread logic */}
                    <h4>Spread: </h4>
                </header>
                <section id="main">
                    {/* <div className="sub-grid">
                        {processedData[0].map((x) => (
                            <span key={x.price}>{x.price}</span>
                        ))}
                    </div>
                    <div className="sub-grid">
                        {processedData[1].map((x) => (
                            <span key={x.price}>{x.price}</span>
                        ))}
                    </div> */}
                </section>
                <section id="footer">
                    <ToggleFeedBtn clickCallback={toggleCallback} />
                </section>
            </div>
        </>
    );
};

export default App;
