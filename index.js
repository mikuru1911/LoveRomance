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
  // A loading cat appears when button is pushed. 
  // 1秒後に消える
  // A loading cat disappers 
  wrapper.appendChild(img)

  // ここが出力処理
  // output process
  setTimeout(() => {
    wrapper.textContent = null;
    const doc = nlp(text);
    const sentences = doc.sentences();
    let sentenceType = [];

    const processedText = [];
    for (let i = 0; i < sentences.length; i++) {
      sentenceType[i] = getType(sentences.eq(i));
      //decide back ground color with sentence type
      let bgColor;
      if (sentenceType[i] === 0) {
        bgColor = "simple";
      }
      else if (sentenceType[i] === 1) {
        bgColor = "compounds";
      }
      else if (sentenceType[i] === 2) {
        bgColor = "complex";
      }
      else {
        bgColor = "others";
      }
      //colored noun phrases
      let result = detectNounPhrase(sentences.eq(i));
      //store processed text
      processedText.push(`<p class="${bgColor}">${result}</p>`);
    }

    output.innerHTML = processedText.join('');

    const nounPhrases = document.querySelectorAll(".nounPhrase");

    nounPhrases.forEach((phrase) => {
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = "Mr. retsu is God.";
      tooltip.style.display = "none";
      phrase.style.position = "relative";
      phrase.appendChild(tooltip);

      phrase.addEventListener("mouseover", function () {
        tooltip.style.display = "block";
      });
      phrase.addEventListener("mouseout", function () {
        tooltip.style.display = "none";
      });
    })
  }, 1000);
}

function getType(doc) {

  const items = doc.splitOn('#Conjunction');
  let NumOfClauses = 0;
  for (let i = 0; i < items.length; i++) {
    let tmp = items.eq(i);
    if (tmp.verbs().found) {
      NumOfClauses += tmp.clauses().length;
    }
  }

  const jsonObj = doc.json();
  if (NumOfClauses >= 2) {
    if (isCompounds(jsonObj)) {
      return 1;
    }
    else {
      return 2;
    }
  }
  else if (NumOfClauses === 1) {
    return 0;
  }
  else {
    return -1;
  }
}

function isCompounds(sentence) {
  const FANBOYS = ["for", "and", "nor", "but", "or", "yet", "so"];
  let isFirstNoun = false;
  let isSecondNoun = false;
  let isFirstSet = false;
  let isFANBOYS = false;

  for (let i = 0; i < sentence[0].terms.length; i++) {
    //search all tags in a word
    for (let j = 0; j < sentence[0].terms[i].tags.length; j++) {
      if (sentence[0].terms[i].tags[j] == "Noun") {
        if (isFirstSet && isFANBOYS) {
          isSecondNoun = true;
        }
        else {
          isFirstNoun = true;
        }
      }

      if (sentence[0].terms[i].tags[j] == "Verb") {
        if (isFirstNoun && !isSecondNoun) {
          isFirstSet = true;
        }
        else if (isSecondNoun) {
          isSecondSet = true;
        }
      }

      if (FANBOYS.includes(sentence[0].terms[i].normal)) {
        if (isFirstSet) {
          isFANBOYS = true;
        }
      }
    }
  }

  if (isFANBOYS) {
    return true;
  }
  else {
    return false;
  }
}

//Detect Noun Phrases and change color
function detectNounPhrase(doc) {
  let nounPhrases = doc.nouns();
  let result = doc.text();
  let arr = nounPhrases.out('array');
  for (let i = 0; i < nounPhrases.length; i++) {
    result = result.replace(arr[i], `<span class="nounPhrase" id="info${i}">${arr[i]}</span>`);
  }

  return result;
}