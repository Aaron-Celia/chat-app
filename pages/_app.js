import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { supabase } from "@/utils/supabase";
import { ContextProvider } from "@/context";
import { Provider } from "react-redux";
import { store } from '../store'

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme(
  { config }, 
  {
	colors: {
		brand: {
			100: "#3d84f7"
		}
	},
	styles: {
		global: () => ({
			body: {
				bg: "whiteAlpha.200"
			}
		})
	}
});

export default function App({ Component, pageProps }) {
	// Create a new supabase browser client on every first render.
	const [supabaseClient] = useState(() => supabase);

	return (
		<SessionContextProvider
			supabaseClient={supabaseClient}
			initialSession={pageProps.initialSession}>
      <ChakraProvider theme={theme}>
        <Provider store={store}>
          <ContextProvider>
			      <Component {...pageProps} />
          </ContextProvider>
        </Provider>
      </ChakraProvider>
		</SessionContextProvider>
	);
}
