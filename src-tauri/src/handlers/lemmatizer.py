import spacy

nlp = spacy.load("de_dep_news_trf")


def lemmatize(word):
    doc = nlp(word)

    lemmas = []
    for token in doc:
        lemmas.append(token.lemma_)

    if len(lemmas) == 0:
        return word

    return lemmas[0]


try:
    while a := input():
        print(lemmatize(a))
except KeyboardInterrupt:
    pass
