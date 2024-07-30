🚧 This project is still in its early development phase.

If you would like to contribute to this project, feel free to request features and create pull requests!

# Introduction

Zimmers is a German language learning application for English speakers. It follows the Immersion learning philosophy to
make language learning engaging and effective.

## Key Features:

- **Immersive Learning** 🚧: Helps learners consume various forms of media (books, texts, websites, videos, comics, etc.)
  in German.
- **Integrated Dictionary** 🚧: Provides detailed information about words and sentences.
- **Flashcard Integration** 🚧: Easily add new vocabulary and information to flashcards for efficient review.
- **Multi-language Support** ❌: Currently supports German, with more languages coming soon.

# Design & Choices

## Overview

- The desktop application is built using [Tauri V2](https://v2.tauri.app/).
- The front-end is made using [ReactJs](https://react.dev/)
  in [TypeScript](https://www.typescriptlang.org/). [TailwindCSS](https://tailwindcss.com/)
  and [ShadCN](https://ui.shadcn.com/) are used for the components and styling.
- Extensions are used for modular and extensible definition of dictionary and media tools.

## Extensions

Extensions are singular JavaScript files that can be used to give features to the application.
The current extension can be founud in the `/extension` folder in the repository source code.

These extensions will be `eval`uated after which they will return an object with functions that extend the
functionalities of the app.

All extension objects include the `getMetadata` function which will return information regarding the extension like:

- name
- version
- description
- extensionType (`lookup-provivder` | `media-support`)

At the moment, two extension types have been defined:

### Lookup Provider 🚧

This extension type adds an extra source of information for the dictionary to present, which can then be added to ANKI
as a flashcard

Extensions of this type could provide all sorts of information like:

- Definitions
- Verb Conjucation
- Noun Article
- Pronunciation
- Examples
- ...

### Media Support ❌

This extension type could extend the file and media types that can be added to the media library of the application.

Note: Neither media support extensions nor the media library have been implemented yet and the design decisions have yet
to be completely made.

## Development

### Run

You can get the app up and running by cloning this repsository and going into it.
To do that, run the following code in your terminal:

```bash
git clone git@github.com:Umami-Turtle/zimmers.git
cd zimmers
```

And then, making sure that you have a package manager installed (I use [bun](https://bun.sh/), and it's needed for
compiling the extensions so get it), you can go ahead and install the packages.

```bash
bun i
```

And finally run the project

```bash
bun tauri dev
```

A window should open after the vite runs and the rust files compile.



