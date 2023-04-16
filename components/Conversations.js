import {
	Box,
	Button,
	Center,
	Stack,
	Text,
	useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton
} from "@chakra-ui/react";
import { supabase } from "@/utils/supabase";
import { Input } from "@chakra-ui/react";
import Image from "next/image";
import { useUser } from "@supabase/auth-helpers-react";
import CurrentConversation from "./CurrentConversation";

export default function Conversations() {
	const [convos, setConvos] = useState([]);
	const [convoId, setConvoId] = useState("");
	const [receiverName, setReceiverName] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const user = useUser();
	const handleSignOut = async () => {
		try {
			await supabase.auth.signOut();
		} catch (err) {
			console.log("err", err);
		}
	};
	console.log("convos = ", convos);

	const findUsers = async (query) => {
		try {
			let { data, error } = await supabase
				.from("profiles")
				.select("*")
				.ilike("full_name", `%${query}%`);
			if (error) console.log("error", error);
			setSearchResults(data);
		} catch (err) {
			console.log("err", err);
		}
	};

	const startConversation = async (
		creatorId,
		creatorName,
		receiverId,
		receiverName
	) => {
		if (convos.find((convo) => convo.name === receiverName)) { // will be a logical bug if two people have the same exact names on their google account, but that's a very rare case.
			alert("conversation already exists");
			return;
		}
		const { data, error } = await supabase
			.from("convos")
			.insert([
				{
					userIdOne: creatorId,
					userIdTwo: receiverId,
					creatorName: creatorName,
					receiverName: receiverName
				}
			])
			.select("*");
		if (error) {
			console.log("error startConversation", error);
			return;
		}
		setConvos([{ name: data[0].receiverName, id: data[0].id }, ...convos]);
		onClose();
	};

	const getConvos = async (payload) => {
		if (payload) {
			if (convos.includes({ name: payload.receiverName, id: payload.id })) { // AKA do nothing if the conversation already exists. It won't if this function gets called with a payload passed to it but it's good to have this check here just in case. 
				return;
			}
			if (payload.creatorName === user?.user_metadata.full_name) {
				setConvos([{ name: payload.receiverName, id: payload.id }, ...convos]);
			} else {
				setConvos([{ name: payload.creatorName, id: payload.id }, ...convos]);
			}
		} else {
			const { data, error } = await supabase
				.from("convos")
				.select("*")
				.or(`userIdOne.eq.${user?.id}, userIdTwo.eq.${user?.id}`);
			if (error) console.log("error getConvos", error);
			const conversations = data.map((convo) => {
				if (convo.creatorName === user?.user_metadata.full_name) {
					return {
						name: `${convo.receiverName}`,
						id: convo.id
					};
				} else {
					return {
						name: `${convo.creatorName}`,
						id: convo.id
					};
				}
			});
			setConvos(conversations);
		}
	};

	useEffect(() => {
		supabase
			.channel("new-convo")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "convos"
				},
				(payload) => {
					console.log("payload.new", payload.new);
					if (
						payload.new.userIdTwo === user?.id // userIdTwo is the receiver
					) {
						getConvos(payload.new);
					}
				}
			)
			.subscribe();
		getConvos();
	}, []);

	return (
		<Box display="flex">
			<Stack>
				<Box
					position="fixed"
					left="0"
					height="15vh"
					width="20vw"
					backgroundColor="black"
					display="flex"
					flexDirection="column">
					<Button color="red" onClick={handleSignOut}>
						Sign Out
					</Button>
					<Button color="#3d84f7" marginTop="10px" onClick={onOpen}>
						Start a new conversation
					</Button>
					<Text fontSize="2xl">Conversations</Text>
					<hr />
					<Modal isOpen={isOpen} onClose={onClose}>
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>Search Users</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<Input
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search for a name"
									value={searchQuery}
								/>
								<Box overflow="hidden">
									{searchResults?.map((result) =>
										result.id === user?.id ? null : (
											<Box>
												<Button
													onClick={async () => {
														await startConversation(
															user?.id,
															user?.user_metadata.full_name,
															result.id,
															result.full_name
														);
														console.log("convos: ", convos);
														setSearchQuery("");
														setSearchResults([]);
													}}>
													{result.full_name}
												</Button>
											</Box>
										)
									)}
								</Box>
							</ModalBody>

							<ModalFooter>
								<Center width="100%">
									<Button colorScheme="red" mr={3} onClick={onClose}>
										Close
									</Button>
									<Button
										onClick={() => findUsers(searchQuery)}
										backgroundColor="#3d84f7"
										mr={3}>
										Search
									</Button>
								</Center>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</Box>
				<Box
					width="20vw"
					position="fixed"
					top="13vh"
					height="100vh"
					backgroundColor="black"
					overflow="scroll">
					{convos.length ? (
						convos.map((convo) => (
							<Center>
								<Button
									backgroundColor={convoId === convo.id ? "#454545" : "gray"}
									width="85%"
									height="70px"
									mt={2}
									onClick={() => {
                                        setConvoId(convo.id);
                                        setReceiverName(convo.name);
                                    }}>
									<Text color="white">{convo.name}</Text>
								</Button>
							</Center>
						))
					) : (
						<Center mt={5}>
							<Text color="white">No conversations yet</Text>
						</Center>
					)}

					<Box
						width="80vw"
						height="100vh"
						overflow="auto"
						position="relative"
						left="20vw">
						<CurrentConversation receiver={receiverName} convoId={convoId} />
					</Box>
				</Box>
			</Stack>
		</Box>
	);
}
