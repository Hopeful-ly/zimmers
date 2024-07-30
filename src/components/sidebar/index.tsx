import {motion} from "framer-motion";
import {useAtom,} from "jotai";
import {ChevronRight} from "lucide-react";
import {pageAtom, PageKey, pages} from "@/lib/navigation.tsx";
import {cn} from "@/lib/utils.ts";
import {atomWithStorage} from "jotai/utils"

export const sidebarAtom = atomWithStorage("sidebar", {open: false},);

export default function Sidebar() {
    const [sidebar, setSidebar] = useAtom(sidebarAtom);
    const [pageKey, setPageKey] = useAtom(pageAtom)

    return (
        <>
            <motion.div
                className="fixed z-10 -translate-y-1/2 cursor-pointer top-1/2"
                animate={{
                    x: sidebar.open ? 216 : 0,
                    rotateZ: sidebar.open ? 180 : 0,
                    color: sidebar.open ? "#fff" : "#000",
                }}
                transition={{bounce: false}}
                onClick={() => setSidebar({open: !sidebar.open})}
            >
                <ChevronRight size={30}/>
            </motion.div>
            <motion.div
                className="fixed top-0 left-0 w-64 h-screen bg-gray-800"
                initial={{x: -256}}
                animate={{x: sidebar.open ? 0 : -256}}
                transition={{bounce: false}}
            >
                <div>
                    <div className="flex items-center justify-center h-16 bg-gray-900">
                        <h1 className="text-3xl font-light text-white text-pretty">
                            ZIMMERS
                        </h1>
                    </div>
                    <div className="p-4">
                        <ul className="flex flex-col gap-2">
                            {
                                Object.entries(pages).map(([key, {title, icon}]) => {
                                    return (
                                        <li
                                            key={key}
                                            className={
                                                cn(
                                                    "p-2 flex gap-3 bg-gray-800 text-white font-bold rounded cursor-pointer hover:bg-gray-700 transition",
                                                    pageKey === key && "bg-gray-700" && "text-pretty"
                                                )
                                            }
                                            onClick={() => setPageKey(key as PageKey)}>
                                            <span>{icon}</span>
                                            {title}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
