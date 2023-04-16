import { supabase } from "@/utils/supabase";
import { Box } from "@chakra-ui/react";
import Conversations from "./Conversations";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useContext } from "react";
import { Context } from "@/context";
import CurrentConversation from "./CurrentConversation";

export default function Chat() {
    const user = useUser();
    const { displayed } = useContext(Context);
    useEffect(() => {
        const makeProfile = async () => {
        const { data, error } = supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id);

        if(!data) {
            const madeUser = await supabase
                .from('profiles')
                .insert([
                    {
                        id: user?.id,
                        full_name: user?.user_metadata.full_name,
                        avatar_url: user?.user_metadata.avatar_url,
                    }
                ]);
            if(!madeUser.error){
                console.log('success');
            } else {
                console.log('makeProfile error: ', madeUser.error);
            }
        } else {
            console.log('user already exists');
        }
    }
    makeProfile();
    }, []);
	return (
		<Box>
            <Conversations />
            {displayed && <CurrentConversation />}
        </Box>
	);
}
