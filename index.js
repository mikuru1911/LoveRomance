const processStart = () => {
  const text = document.getElementById('textInput').value;
  const output = document.getElementById('output');
  const loading = document.getElementById('loading');
  const btn = document.getElementById("btn")
  const wrapper = document.getElementById("wrapper")

  if (text.trim() === "") {
    output.innerText = "Please enter some text.";
    return;
  }
  const date = new Date()
  const timestamp = date.getTime()

  const img = document.createElement("img")
  img.src = "./images/cat_dance.gif?" + timestamp
  img.style.width = "60px"
  wrapper.textContent = null

  // ボタンを押したらローディング猫が出る。
  // 1秒後に消える
  setTimeout(() => {
    wrapper.appendChild(img)
  }, 0)

  // ここが出力処理
  setTimeout(() => {
    wrapper.textContent = null;
    let doc = nlp(text);
    let past = doc.sentences().toPastTense().text();
    output.innerText = past;
  }, 1000);
}
