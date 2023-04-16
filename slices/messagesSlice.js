import { supabase } from "@/utils/supabase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = [];

export const fetchMessagesAsync = createAsyncThunk('fetch/messages', async ({ convoId }) => {
    try{
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("convoId", convoId);
        if (error) console.log("error", error);
        console.log("data in thunk", data);
        return data;
    } catch(err){
        console.log("error in fetchMessagesAsync thunk", err);
    }
})

export const createMessageAsync = createAsyncThunk(
	"messages/create",
	async ({ convoId, message, sender, receiver }) => {
        try {
            const { data, error: insertError } = await supabase
                .from("messages")
                .insert({ convoId, sender, receiver, message })
                .single();
            if (insertError) {
                throw new Error(insertError.message);
            }
            console.log("data in createMessage thunk", data)
            return data;
        } catch(err){
            console.log("error in createMessage thunk", err);
        }
	}
);

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        updateMessages: (state, action) => {
            state.push(action.payload)
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessagesAsync.fulfilled, (state, action) => {
            return action.payload;
        });
        builder.addCase(createMessageAsync.fulfilled, (state, action) => {
            state.push(action.payload);
        })
    }
})

export default messagesSlice.reducer;
export const { updateMessages } = messagesSlice.actions;
// export const getMessages = useSelector(state => state.messages);