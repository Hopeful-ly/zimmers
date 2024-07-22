import Sidebar, {sidebarAtom} from "./components/sidebar";
import ASBPlayground from "./components/asb-playground";
import {motion} from "framer-motion";
import {atom, useAtomValue} from "jotai";
import InitializationProvider from "@/lib/initializer.tsx";
import {ComponentType} from "react";
import SettingsView from "@/components/settings";
import Extensions from "@/components/extensions.tsx";

type PageEntry = {
    title: string,
    Component: ComponentType

}
export const pages: PageEntry[] = [
    {
        title: "ASB Playground",
        Component: ASBPlayground
    },
    {
        title: "Settings",
        Component: SettingsView
    },
    {
        title:"Extensions",
        Component: Extensions
    }


]
export const pageAtom = atom<PageEntry>(pages[0]);

function App() {
    const sidebar = useAtomValue(sidebarAtom);
    const page = useAtomValue(pageAtom);

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
