import {
	Box,
	Button,
	Center,
	Container,
	IconButton,
	Input,
	Stack,
	Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useUser } from "@supabase/auth-helpers-react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { useContext } from "react";
import { Context } from "@/context";
import { useDispatch, useSelector } from "react-redux";
import { createMessageAsync, fetchMessagesAsync } from "@/slices/messagesSlice";

export default function CurrentConversation() {
	const [composedMessage, setComposedMessage] = useState("");
	// const [receiver, setReceiver] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const [newMessage, setNewMessage] = useState([]);
	const [messages, setMessages] = useState([]); // array of objects representing each message, objects have sender, receiver, and message keys
	const user = useUser();
	const dispatch = useDispatch();
	// let messages = useSelector((state) => state.messages.messages)
	// const { messages, updateMessages, displayed, convoId, receiver, updateReceiverInfo } = useContext(Context);
	const {
		convoId,
		updateDisplayed,
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
		// fetchMessagesAsync({ convoId: convoId })
		getReceiverInfo();
		getMessagesOnLoad();
	}, [convoId]);
	// useEffect(() => {
	// dispatch(createMessageAsync({
	// 	convoId: convoId,
	// 	message: composedMessage,
	// 	sender: user?.id,
	// 	receiver: receiverInfo.id
	// }));
	// supabase
	// 	.channel("messages-insert")
	// 	.on(
	// 		"postgres_changes",
	// 		{ event: "INSERT", schema: "public", table: "messages" },
	// 		(payload) => {
	// 			// When a new message is inserted into the messages table, add it to the messages state
	// 			if (payload.new.convoId === convoId) {
	// 				setMessages((messages) => [...messages, payload.new]);
	// 			}
	// 		}
	// 	)
	// 	.subscribe();
	// }, [submitted]);
	console.log("MESSAGES", messages ? messages : null);
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
                                    // backgroundColor='red'
										// backgroundColor={
										// 	message.sender === user?.id ? "#3d84f7" : "gray"
										// }
										// position="relative"
										// left={message.sender === user?.id ? null : "0px"}
										// right={message.sender === user?.id ? "0px" : null}
										height="auto"
										width="100%"
										key={`${index}`}
										margin="3px">
										<Box
											backgroundColor={
												message.sender === user?.id ? "#3d84f7" : "gray"
											}
                                            width='100%'>
											<Text
												position="relative"
												left={message.sender === user?.id ? "" : "0"}
												right={message.sender === user?.id ? "0" : ""}>
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
