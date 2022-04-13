import { ILabelStyles, Label } from "@fluentui/react";
import React, { useEffect, useState } from "react";
import { getHours, getMinutes, getSeconds } from "../../../../common/utils";
import { ITimer } from "./ITimer";

function Timer(props: ITimer) {
    const [time, setTime] = useState(0);
    const running = true;
    const timerStyles: ILabelStyles = { root: props.timerStyles };

    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => prevTime + 1000);
        }, 1000);
        return () => clearInterval(interval);
    }, [running]);

    return (
        <Label styles={timerStyles}>
            {props.showHours && getHours(time) + ":"}{getMinutes(time)}:{getSeconds(time)}
        </Label>
    );
}

export default Timer;