import {addNote} from "../src/lib/anki-connect";

const res = await addNote({
    deckName: "Test",
    modelName: "Basic",
    fields: {
        Front: "Front",
        Back: ""
    } as any,
    tags: [],
    picture: [{
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/A_black_cat_named_Tilly.jpg/220px-A_black_cat_named_Tilly.jpg",
        "filename": "black_cat.jpg",
        "fields": [
            "Back"
        ]
    }]

})

if (res.isErr()) {
    console.log('Error!')
    console.error(res.error)
} else {
    console.log('Success!')
    console.log(res.value)
}

