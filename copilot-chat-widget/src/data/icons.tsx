/* eslint-disable max-len */
export const getSendingIconWithFill = (val: string) => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14"><path fill={val ?? "currentColor"} d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12m0-1A5 5 0 1 1 8 3a5 5 0 0 1 0 10"/></svg>
};

export const getSentIconWithFill = (val: string) => {
    return <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM5.24953 7.04242L8.12028 4.16398C8.31528 3.96846 8.63186 3.96803 8.82738 4.16304C9.00118 4.33637 9.02083 4.60577 8.88609 4.80082L8.82833 4.87014L5.60403 8.10308C5.43053 8.27704 5.16082 8.29654 4.96576 8.16146L4.89645 8.10355L3.14645 6.35355C2.95118 6.15829 2.95118 5.84171 3.14645 5.64645C3.32001 5.47288 3.58944 5.4536 3.78431 5.58859L3.85355 5.64645L5.24953 7.04242L8.12028 4.16398L5.24953 7.04242Z" fill={val ?? "currentColor"}/>
    </svg>
};

export const getFailedStatusIconWithFill = (val: string) => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14"><path fill={val ?? "currentColor"} d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2m0 1a5 5 0 1 0 0 10A5 5 0 0 0 8 3m0 7a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m0-5.5a.5.5 0 0 1 .492.41L8.5 5v3.5a.5.5 0 0 1-.992.09L7.5 8.5V5a.5.5 0 0 1 .5-.5"/></svg>
};
