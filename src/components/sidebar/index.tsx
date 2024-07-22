import { motion } from "framer-motion";
import {atom, useAtom, useSetAtom} from "jotai";
import { ChevronRight } from "lucide-react";
import {pageAtom, pages} from "@/App.tsx";

export const sidebarAtom = atom({
  open: false,

});

export default function Sidebar() {
  const [sidebar, setSidebar] = useAtom(sidebarAtom);
  const setPage= useSetAtom(pageAtom);

  return (
    <>
      <motion.div
        className="absolute z-10 -translate-y-1/2 cursor-pointer top-1/2"
        animate={{
          x: sidebar.open ? 216 : 0,
          rotateZ: sidebar.open ? 180 : 0,
          color: sidebar.open ? "#fff" : "#000",
        }}
        transition={{  bounce: false }}
        onClick={() => setSidebar({ open: !sidebar.open })}
      >
        <ChevronRight size={30} />
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 w-64 h-screen bg-gray-800"
        initial={{ x: -256 }}
        animate={{ x: sidebar.open ? 0 : -256 }}
        transition={{  bounce: false }}
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
                    pages.map((page) => {
                        return (
                            <li
                                className="p-2 bg-gray-800 text-white font-bold rounded cursor-pointer hover:bg-gray-700 transition"
                                key={page.title} onClick={() => setPage(page)}>
                                {page.title}
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
