import re
import simplemma
import unicodedata

simplemma_languages = ['de']


def lem_pre(word, language):
    _ = language
    word = re.sub(r'[\?\.!«»”“"…,()\[\]]*', '', word).strip()
    word = re.sub(r'<.*?>', '', word)
    word = re.sub(r'\{.*?\}', "", word)
    return word


def lem_word(word, language, greedy=False):
    return lemmatize(lem_pre(word, language), language, greedy)


def lemmatize(word, language, greedy=True):
    try:
        if not word:
            return word
        if language in simplemma_languages:
            return simplemma.lemmatize(word, lang=language, greedy=greedy)
        else:
            return word
    except Exception as e:
        print(e)
        return word


print(lem_word( "möchte", "de"))



