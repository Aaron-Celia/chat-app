import { Button, Center, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import googleIcon from "@/public/google.png";
import { supabase } from "@/utils/supabase";
import { useUser } from "@supabase/auth-helpers-react";

export default function Auth() {
    const user = useUser();
	async function handleSignIn() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google"
            });
            if (error) console.log("error", error);
            else if(user) {
                console.log("user", user);
            }
        } catch (err) {
            console.log("err", err);
        }
	}
	return (
		<Center height="100vh">
			<Stack>
				<Text fontSize={24}>Please Sign In</Text>
				<Button
					rightIcon={<Image height={20} src={googleIcon} alt="Google Icon" />}
					onClick={handleSignIn}>
					Sign In
				</Button>
			</Stack>
		</Center>
	);
}
