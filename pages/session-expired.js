import { Button, Center, Stack, Text } from "@chakra-ui/react";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";


export default function SessionExpired() {
    const [submitted, setSubmitted] = useState(false);
    const user = useUser();
    const router = useRouter()
    useEffect(() => {
        if(user){
            router.push('/');
        }
    }, [submitted]);
  return (
    <Center height='100vh'>
        <Stack>
            <Text fontSize='36px'>Session expired, please sign in again</Text>
            <Button onClick={async () => {
                await supabase.auth.signInWithOAuth({
                    provider: 'google'
                });
                setSubmitted(!submitted);
            }}>Sign In</Button>
        </Stack>
    </Center>
  )
}
