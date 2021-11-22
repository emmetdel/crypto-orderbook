import React, {useEffect} from "react";
import ToggleFeedBtn from "components/ToggleFeedBtn/toggle-feed-button.component";
import Api, {ProductID, WSResponse} from "./data/Api";
import OrderBookProcessor from "./utils/order-processing";

// styles
import "./styles/index.scss";

const App: React.FC = () => {
    const processor = new OrderBookProcessor();
    const api = new Api(ProductID.Bitcoin, (data: WSResponse) => processor.processData(data));

    useEffect(() => {
        api.connect();

        setTimeout(() => {
            api.disconnect();
            console.debug(processor.asks);
            console.debug(processor.bids);
        }, 500);
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
                    <div className="sub-grid">Sub 1</div>
                    <div className="sub-grid">Sub 2</div>
                </section>
                <section id="footer">
                    <ToggleFeedBtn clickCallback={toggleCallback} />
                </section>
            </div>
        </>
    );
};

export default App;
