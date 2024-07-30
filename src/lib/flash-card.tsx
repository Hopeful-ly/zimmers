import {renderToStaticMarkup} from "react-dom/server";
import * as settings from '@/lib/settings'
import {ReactNode} from "react";
import {twj} from "tw-to-css";
import {Model} from "@/lib/anki-connect.ts";
import * as store from "@/lib/store.ts";

export const flashcardInitialization = async () => {
    settings.registerSetting('flashcard.deckName',
        {
            type: "string",
            defaultValue: "zimmers",
            description: "Which deck to create and store the flashcards in",
            storeKey: 'flashcard.deckName',
            title: "Deck name"
        }
    )

    settings.registerSetting('flashcard.modelName',
        {
            type: "string",
            defaultValue: "Zimmers-Immersion",
            description: "Which model to use for the flashcards",
            storeKey: 'flashcard.modelName',
            title: "Model name"
        }
    )
}

export type FlashcardProps = {
    word: string;
    pronunciation: string;
    definition: string;
    examples: {
        example: string;
        translation: string;
    }[];
}

export const FIELDS = {
    word: "{{word}}",
    sentence: "{{sentence}}",
    definition: "{{definition}}",
    article: "{{article}}",
    extra: "{{extra}}",
    example_1: "{{example_1}}",
    example_t_1: "{{example_t_1}}",
    example_2: "{{example_2}}",
    example_t_2: "{{example_t_2}}",
    example_3: "{{example_3}}",
    example_t_3: "{{example_t_3}}",
    pronunciation: "{{pronunciation}}",
    image: "{{image}}",
}

export const FlashcardFront = (<div style={twj('p-5 text-center')}>
    <div>
        {FIELDS.image}
    </div>
    <p style={twj('text-lg')}>{FIELDS.sentence}</p>
    <h1 style={twj('text-3xl font-bold')}>{FIELDS.word}</h1>
</div>)

export const FlashcardBack = (<div style={twj('p-5 text-center')}>
    {FlashcardFront}
    <p style={twj('text-lg')}>{FIELDS.pronunciation}</p>
    <p style={twj('text-lg')}>{FIELDS.definition}</p>
    <div
        style={twj('flex flex-col gap-2 max-w-screen-sm mx-auto')}>
        <div>
            <div style={twj('font-bold')}>
                {FIELDS.example_1}
            </div>
            <div style={twj('font-bold opacity-50')}>
                {FIELDS.example_t_1}
            </div>
        </div>
        <div>
            <div style={twj('font-bold')}>
                {FIELDS.example_2}
            </div>
            <div style={twj('font-bold opacity-50')}>
                {FIELDS.example_t_2}
            </div>
        </div>
        <div>
            <div style={twj('font-bold')}>
                {FIELDS.example_3}
            </div>
            <div style={twj('font-bold opacity-50')}>
                {FIELDS.example_t_3}
            </div>
        </div>
    </div>


</div>)


const toHTML = (jsx: ReactNode) => renderToStaticMarkup(jsx, {})

const flashcardFrontHTML = toHTML(FlashcardFront)
const flashcardBackHTML = toHTML(FlashcardBack)


export const getZimmersModel = () => ({
    css: `
    img {
        max-width: 200px;
        height: auto;
        margin-inline: auto;
        display: block;
    }
    `,
    modelName: store.get("lookup.flashcard.modelname"),
    cardTemplates: [
        {
            Front: flashcardFrontHTML,
            Back: flashcardBackHTML
        }
    ],
    inOrderFields: Object.keys(FIELDS) as (keyof typeof FIELDS)[],
    isCloze: false,

} satisfies Model)


