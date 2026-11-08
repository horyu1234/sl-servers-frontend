import React, {createContext, useEffect, useState} from "react";
import type {ReactNode} from "react";
import axios from "axios";

// 공지사항 상태를 저장할 Context 생성
export const NoticeContext = createContext<string | undefined>(undefined);

export const NoticeProvider = ({children}: {children: ReactNode}) => {
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await axios.get<string>("https://checker.horyu.me/web/scplist.kr/notice", {
                    params: {
                        _: new Date().getTime()
                    }
                });
                if (response.data) {
                    setNotice(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch notice", error);
            }
        };

        fetchNotice();
    }, []);

    return (
        <NoticeContext.Provider value={notice}>
            {children}
        </NoticeContext.Provider>
    );
};
