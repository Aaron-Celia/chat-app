import { Context } from "@/context";
import { createMessageAsync } from "@/slices/messagesSlice";
import { supabase } from "@/utils/supabase";
import { ArrowUpIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Center,
    Input,
    Stack,
    Text
} from "@chakra-ui/react";
import { useUser } from "@supabase/auth-helpers-react";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function CurrentConversation() {
	const [composedMessage, setComposedMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const user = useUser();
	const dispatch = useDispatch();
	const {
		convoId,
		displayed,
		receiverInfo,
		updateReceiverInfo
	} = useContext(Context);
	console.log("convoId: ", convoId);

	const getReceiverInfo = async () => {
		const { data, error } = await supabase
			.from("convos")
			.select("*")
			.eq("id", convoId);
		if (error) {
			console.log("error getReceiverName: ", error);
			return;
		}
		data[0].userIdOne === user?.id
			? updateReceiverInfo({
					name: data[0].receiverName,
					id: data[0].userIdTwo
			  })
			: updateReceiverInfo({
					name: data[0].creatorName,
					id: data[0].userIdOne
			  });
	};

	const channel = supabase
		.channel("messages-insert")
		.on(
			"postgres_changes",
			{ event: "INSERT", schema: "public", table: "messages" },
			(payload) => {
				// When a new message is inserted into the messages table, add it to the messages state
				if (payload.new.convoId === convoId) {
					setMessages((messages) => [...messages, payload.new]);
				}
			}
		)
		.subscribe();

	const getMessagesOnLoad = async () => {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("convoId", convoId);
        if (error) {
            console.log("error getMessagesOnLoad: ", error);
            return;
        }
        setMessages(data);
    }

	useEffect(() => {
		getReceiverInfo();
		getMessagesOnLoad();
	}, [convoId]);
	return (
		<>
			{displayed && (
				<Box
					className="innerBox"
					overflow="auto"
					height="100vh"
					width="80vw"
					position="fixed"
					right="0">
					<Box
						height="60px"
						backgroundColor="black"
						display="flex"
						justifyContent="center"
						alignItems="center">
						<Text fontSize="24px">
							{receiverInfo ? receiverInfo.name : "No conversation selected"}
						</Text>
					</Box>
					<Box
						overflow="auto"
						position="absolute"
						bottom="40px"
						top="60px"
						width="80vw">
						<Stack>
							{messages?.length ? (
								messages.map((message, index) => (
									<Box
										height="auto"
										width="100%"
										key={`${index}`}
										margin="3px">
										<Box
											backgroundColor={
												message.sender === user?.id ? "#3d84f7" : "gray"
											}
                                            width='100%'
                                            height='auto'>
											<Text
												position="relative"
												left={message.sender === user?.id ? "" : "0"}
												right={message.sender === user?.id ? "0" : ""}
                                                fontSize='2xl'>
												{message.message}
											</Text>
										</Box>
									</Box>
								))
							) : (
								<Center height="100%" width="100%">
									<Text fontSize="24px">No Messages</Text>
								</Center>
							)}
						</Stack>
					</Box>
					<Box
						display="flex"
						position="fixed"
						bottom="2px"
						height="40px"
						backgroundColor="black">
						<Input
							width="70vw"
							onChange={(e) => setComposedMessage(e.target.value)}
							onKeyDown={async (e) => {
								if (e.key === "Enter") {
									dispatch(
										createMessageAsync({
											convoId: convoId,
											message: composedMessage,
											sender: user?.id,
											receiver: receiverInfo.id
										})
									);
									setComposedMessage("");
								}
							}}
							value={composedMessage}
							placeholder="Message..."
						/>
						<Button
							width="10vw"
							right="0"
							backgroundColor="#3d84f7"
							rightIcon={<ArrowUpIcon />}
							onClick={async () => {
								dispatch(
									createMessageAsync({
										convoId: convoId,
										message: composedMessage,
										sender: user?.id,
										receiver: receiverInfo.id
									})
								);
								setComposedMessage("");
							}}>
							Send
						</Button>
					</Box>
				</Box>
			)}
		</>
	);
}
