import React, { createContext, useState } from "react";

export const Context = createContext();

export const ContextProvider = ({ children }) => {
	// const [messages, setMessages] = useState([]);
    const [displayed, setDisplayed] = useState(false);
    const [convoId, setConvoId] = useState('')
    const [receiverInfo, setReceiverInfo] = useState({})

	// const updateMessages = (messages) => {
	// 	setMessages(messages);
	// };

    const updateDisplayed = (displayed) => {
        setDisplayed(displayed);
    }

    const updateConvoId = (convoId) => {
        setConvoId(convoId);
    }

    const updateReceiverInfo = (receiverInfo) => {
        setReceiverInfo(receiverInfo);
    }

	return (
		<Context.Provider value={{ convoId, updateConvoId, displayed, updateDisplayed, receiverInfo, updateReceiverInfo }}>
			{children}
		</Context.Provider>
	);
};
