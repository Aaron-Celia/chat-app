import { Box, Button, IconButton, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useUser } from "@supabase/auth-helpers-react";
import { ArrowUpIcon } from "@chakra-ui/icons";

export default function CurrentConversation({ convoId, receiver }) {
    const [composedMessage, setComposedMessage] = useState('');
	const [messages, setMessages] = useState([]); // array of objects representing each message, objects have sender, receiver, and message keys
	const user = useUser();

    const sendMessage = async (message) => {
        const receiver = await supabase
            .from('convos')
            .select('userIdTwo')
            .eq('id', convoId);
        if(receiver.error){
            console.log('error sendMessage: ', receiver.error);
            return;
        } else {
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        sender: user?.user_metadata.full_name,
                        receiver: receiver.data[0].userIdTwo,
                        convoId: convoId,
                        message: composedMessage,
                    }
                ]).select('*');
            if(error) console.log('error', error);
            setMessages([...messages, { sender: data[0].sender, receiver: data[0].receiver, message: data[0].message }]);
        }
    }

	useEffect(() => {
		const getMessages = async () => {
			const { data, error } = await supabase
				.from("messages")
				.select("*")
				.eq("convoId", convoId);
			if (error) console.log("error", error);
			console.log("data", data);
			setMessages(data);
		};
		getMessages();
		supabase
			.channel("messages-channel")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages"
				},
				(payload) => {
					console.log("payload.new", payload.new);
					if (payload.new.convoId === convoId && !messages.includes({ sender: payload.new.sender, receiver: payload.new.receiver, message: payload.new.message })) {
						setMessages([...messages, { sender: payload.new.sender, receiver: payload.new.receiver, message: payload.new.message }]);
					}
				}
			)
			.subscribe();
	}, []);
	return (
		<Box overflow="auto" height="100%" width="100%">
			{messages?.length
				? messages.map((message) => (
						<Box
							backgroundColor={
								message.sender === user?.user_metadata.full_name
									? "#3d84f7"
									: "gray"
							}
							position={
								message.sender === user?.user_metadata.full_name
									? "relative right 5px"
									: "relative left 5px"
							}
							height="auto"
							width="auto">
							{message.message}
						</Box>
				  ))
				: null}
			<Box
				display="flex"
				justifyContent="space-between"
				position="fixed"
				bottom="0">
				<Input
					width="70vw"
					onChange={(e) => setComposedMessage(e.target.value)}
                    value={composedMessage}
					placeholder="Message..."
				/>
				<Button
					width="10vw"
					position="fixed"
					right="0"
					backgroundColor="#3d84f7"
					rightIcon={<ArrowUpIcon />}
					onClick={() => {
						sendMessage(composedMessage);
					}}>
					Send
				</Button>
			</Box>
		</Box>
	);
}
