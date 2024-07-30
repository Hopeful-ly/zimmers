use std::sync::Mutex;

use lazy_static::lazy_static;
use pyo3::prelude::*;

lazy_static! {
    static ref SPACY_MODULE: Mutex<Option<PyObject>> = Mutex::new(None);
}

#[tauri::command]
pub fn initialize_spacy() -> Result<(), String> {
    // let result: Result<(), _> = Python::with_gil(move |py| {
    //     println!("Initializing spacy");
    //     let mut spacy_module_guard = SPACY_MODULE.lock().unwrap();
    //     if spacy_module_guard.is_none() {
    //         println!("Importing spacy module");
    //         let module = PyModule::import_bound(py, "de_dep_news_trf")
    //             .map_err(|e| format!("Error while importing spacy module: {:?}", e))?;
    //         *spacy_module_guard = Some(module.into());
    //     }
    //     println!("Spacy initialized");
    //     Ok(())
    // });
    //
    // if result.is_ok() {
    //     return Ok(());
    // }
    // return result;
    Ok(())
}

#[tauri::command]
pub fn lemmatize(word: String) -> Result<String, String> {
    println!("Lemmatizing word: {}", word);
    let result: Result<String, _> = Python::with_gil(move |py| {
        // println!("Initializing spacy");
        // let mut spacy_module_guard = SPACY_MODULE.lock().unwrap();
        // if spacy_module_guard.is_none() {
        //     println!("Importing spacy module");
        //     let module = PyModule::import_bound(py, "de_dep_news_trf")
        //         .map_err(|e| format!("Error while importing spacy module: {:?}", e))?;
        //     *spacy_module_guard = Some(module.into());
        // }
        // let spacy_module = spacy_module_guard.as_ref().unwrap();
        // println!("Spacy initialized");

        println!("Loading lemmatizer module");
        let lemmatizer_module_result = PyModule::from_code_bound(
            py,
            "\
import simplemma
def lemmatize(word, language, greedy=True):
    try:
        return simplemma.lemmatize(word, lang=language, greedy=greedy)
    except Exception:
        return word
        ",
            "",
            "",
        );

        if lemmatizer_module_result.is_err() {
            println!(
                "Error while creating lemmatizer module: {:?}",
                lemmatizer_module_result.err().unwrap()
            );
            return Err("Error while creating lemmatizer module".to_string());
        }
        let lemmatizer_module = lemmatizer_module_result.unwrap();
        println!("Lemmatizer module loaded");

        println!("Getting lemmatize function");
        let lemmatizer_result = lemmatizer_module.getattr("lemmatize");
        if lemmatizer_result.is_err() {
            println!(
                "Error while getting lemmatize function: {:?}",
                lemmatizer_result.err().unwrap()
            );
            return Err("Error while getting lemmatize function".to_string());
        }

        let lemmatizer: Py<PyAny> = lemmatizer_result.unwrap().into();
        println!("Lemmatize function retrieved");

        println!("Calling lemmatize function");
        let lemma_obj_result = lemmatizer.call1(py, (word, "de"));
        if lemma_obj_result.is_err() {
            println!(
                "Error while calling lemmatize function: {:?}",
                lemma_obj_result.err().unwrap()
            );
            return Err("Error while calling lemmatize function".to_string());
        }

        let lemma_obj = lemma_obj_result.unwrap();
        println!("Lemmatize function called");

        println!("Extracting lemmatized word");
        let lemma_result = lemma_obj.extract::<String>(py);
        if lemma_result.is_err() {
            println!(
                "Error while extracting lemmatized word: {:?}",
                lemma_result.err().unwrap()
            );
            return Err("Error while extracting lemmatized word".to_string());
        }
        let lemma = lemma_result.unwrap();
        println!("Lemmatized word extracted");
        println!("Lemmatized word: {}", lemma);

        Ok(lemma.to_string())
    });

    println!("Lemmatization result: {:?}", result);

    if result.is_ok() {
        return Ok(result.unwrap());
    }

    return Err(format!(
        "Error while lemmatizing word: {}",
        result.err().unwrap()
    ));
}
