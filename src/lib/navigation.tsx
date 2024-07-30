import {ComponentType, ReactNode} from "react";
import {createStore} from "zustand/vanilla";
import {BlocksIcon, CogIcon, FullscreenIcon, WorkflowIcon} from "lucide-react";
import ASBPlayground from "@/components/asb-playground";
import SettingsView from "@/components/settings";
import Extensions from "@/components/extensions.tsx";
import {atomWithStore} from "jotai-zustand";
import {useAtom} from "jotai";
import FlashcardPreview from "@/components/flashcard-preview.tsx";

export type Page = {
    title: string;
    Component: ComponentType;
    icon: ReactNode
}


export const pages = {

    asbPlayground: {
        title: "ASB Playground",
        Component: ASBPlayground,
        icon: <WorkflowIcon/>
    },
    settings: {
        title: "Settings",
        Component: SettingsView,
        icon: <CogIcon/>
    },
    extensions: {
        title: "Extensions",
        Component: Extensions,
        icon: <BlocksIcon/>
    },
    flashcardPreview: {
        title: "Flashcard Preview",
        Component: FlashcardPreview,
        icon: <FullscreenIcon/>
    }

} as const satisfies Record<string, Page>

export type PageKey = keyof typeof pages;

export const pageStore = createStore<PageKey>(() => 'asbPlayground')

export const pageAtom = atomWithStore(pageStore)

export const usePage = () => {
    const [page, setPage] = useAtom(pageAtom);
    return [pages[page], setPage] as const
}

