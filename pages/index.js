import Auth from "@/components/Auth";
import Chat from "@/components/Chat";
import { Box } from "@chakra-ui/react";
import { useUser } from "@supabase/auth-helpers-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const user = useUser();
  // console.log('user = ', user);
	return (
		<Box height='100vh' width='100vw'>
			{user ? <Chat /> : <Auth />}
		</Box>
	);
}
