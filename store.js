import { configureStore } from "@reduxjs/toolkit";
import messagesState from "./slices/messagesSlice";

export const store = configureStore({
    reducer: {
        messages: messagesState
    }
})