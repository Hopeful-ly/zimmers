import Sidebar, {sidebarAtom} from "./components/sidebar";
import {motion} from "framer-motion";
import { useAtomValue} from "jotai";
import InitializationProvider from "@/lib/initializer.tsx";
import {usePage} from "@/lib/navigation.tsx";


function App() {
    const sidebar = useAtomValue(sidebarAtom);
    const [page] = usePage()

    return (
        <>
            <InitializationProvider>
                <Sidebar/>
                <motion.div
                    animate={{
                        paddingLeft: sidebar.open ? 256 : 0,
                    }}
                    transition={{type: "tween"}}
                >
                    <page.Component/>
                </motion.div>
            </InitializationProvider>
        </>
    );
}

export default App;
