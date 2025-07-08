function convertToPast()
{
    let text = document.getElementById('textInput').Value;
    let output = document.getElementById('output');
    let loading = document.getElementById('loading');

    if (text.trim() === "") {
    output.innerText = "Please enter some text.";
    return;
    }

    loading.style.display = "inline-block";
    setTimeout(() => {
      let doc = nlp(text);
      let past = doc.sentences().toPastTense().text();
      output.innerText = past;
      loading.style.display = "none";
    }, 500);
}
   