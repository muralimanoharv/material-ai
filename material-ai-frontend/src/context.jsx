import { createContext } from "react";


export const HistoryContext = createContext({
    history: []
});


export const AppContext = createContext({
    userid: 'user',
    session_id: null
});

export const ThemeToggleContext = createContext();

export const LayoutContext = createContext()


export const ChatItemContext = createContext()




