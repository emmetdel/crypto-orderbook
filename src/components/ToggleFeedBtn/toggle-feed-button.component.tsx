import React from "react";

// styles
import "./toggle-feed-btn.scss";

interface ToggleFeedBtnProps {
    clickCallback: () => void;
}

const ToggleFeedBtn: React.FC<ToggleFeedBtnProps> = ({clickCallback}) => (
    <button onClick={clickCallback}>Toggle Feed</button>
);

export default ToggleFeedBtn;
