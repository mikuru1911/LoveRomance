const processStart = () => {
  const text = document.getElementById('textInput').value;
  const output = document.getElementById('output');
  const loading = document.getElementById('loading');

  if (text.trim() === "") {
    output.innerText = "Please enter some text.";
    return;
  }

  loading.style.display = "inline-block";
  // ここが出力処理
  setTimeout(() => {
    let doc = nlp(text);
    let past = doc.sentences().toPastTense().text();
    output.innerText = past;
    loading.style.display = "none";
  }, 500);
}
