import {FlashcardBack, FlashcardFront} from "@/lib/flash-card.tsx";

export default function FlashcardPreview() {
    return <div
        className="p-4 flex justify-center items-center gap-4 flex-col"
    >
        <div className="border-2 w-full rounded">
            {FlashcardFront}
        </div>
        <div className="border-2 w-full rounded">
            {FlashcardBack}
        </div>

    </div>
}