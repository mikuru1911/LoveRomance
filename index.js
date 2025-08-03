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
  wrapper.appendChild(img)

  // ここが出力処理
  setTimeout(() => {
    wrapper.textContent = null;
    const doc = nlp(text);
    const sentences = doc.sentences();
    let sentenceType = [];

    const processedText  = [];
    for(let i = 0; i<sentences.length; i++)
    {
      sentenceType[i] =  getType(sentences.eq(i));
      //背景色の決定
      let bgColor;
      if(sentenceType[i] === 0)
      {
        bgColor = "simple";
      }
      else if(sentenceType[i] === 1)
      {
        bgColor = "compounds";
      }
      else if(sentenceType[i] === 2)
      {
        bgColor = "complex";
      }
      else
      {
        bgColor = "others";
      }
      //nounPhraseの色付け
      let result = detectNounPhrase(sentences.eq(i));//resultはnounPhraseに色をつけた文字列
      //処理済みのデータを格納
      processedText.push(`<p class="${bgColor}">${result}</p>`);
    }
    
    output.innerHTML = processedText.join('');
  }, 1000);
}

function getType(doc)
{
  const NumOfClauses = doc.clauses().length;
  const jsonObj = doc.json();
  if(NumOfClauses>=2)
  {
    //console.log("Not simple" + NumOfClauses);
    if(isCompounds(jsonObj))
    {
      return 1;
    }
    else
    {
      return 2;
    }
  }
  else if(NumOfClauses === 1)
  {
    if(isComplex)
    {
      return 2;
    }
    else
    {
      return 0;      
    }
  }
  else
  {
    return -1;
  }
}

function isComplex(sentence)
{
  for(let i = 0; i<sentence[0].terms.length; i++)
  {
    //search all tags in a word
    for(let j = 0; j<sentence[0].terms[i].tags.length; j++)
    {
      if(sentence[0].terms[i].tags[j] == "Noun")
      {
        if(isFirstSet)
        {
          isSecondNoun = true;
        }
        else
        {
          isFirstNoun = true;
        } 
      }

      if(sentence[0].terms[i].tags[j] == "Verb")
      {
        if(isFirstNoun && !isSecondNoun)
        {
          isFirstSet = true;
        }
        else if(isSecondNoun)
        {
          isSecondSet = true;
        }
      }
    }
  }

  if(isSecondSet === true)
  {
    return true;
  }
  else
  {
    return false;
  }
}

function isCompounds(sentence)
{
  const FANBOYS = ["for", "and", "nor", "but", "or", "yet", "so"];
  let isFirstNoun = false;
  let isSecondNoun = false;
  let isFirstSet = false;
  let isFANBOYS = false;

  for(let i = 0; i<sentence[0].terms.length; i++)
  {
    //search all tags in a word
    for(let j = 0; j<sentence[0].terms[i].tags.length; j++)
    {
      if(sentence[0].terms[i].tags[j] == "Noun")
      {
        if(isFirstSet && isFANBOYS)
        {
          isSecondNoun = true;
        }
        else
        {
          isFirstNoun = true;
        } 
      }

      if(sentence[0].terms[i].tags[j] == "Verb")
      {
        if(isFirstNoun && !isSecondNoun)
        {
          isFirstSet = true;
        }
        else if(isSecondNoun)
        {
          isSecondSet = true;
        }
      }

      if(FANBOYS.includes(sentence[0].terms[i].normal))
      {
        if(isFirstSet)
        {
          isFANBOYS = true;
        }
      }
    }
  }
  
  if(isFANBOYS)
  {
    return true;
  }
  else
  {
    return false;
  }
}

//Noun Phraseを検出して色を置き換えます。
function detectNounPhrase(doc)
{
  let nounPhrases = doc.nouns();
  let result = doc.text();
  let arr = nounPhrases.out('array');

  for(let i=0; i<nounPhrases.length; i++)
  {
    result = result.replace(arr[i], `<span class="nounPhrase">${arr[i]}</span>`);
  }

  return result;
}

function nounPharaseCtegory(doc)
{
  let jsonObj =  doc.json();
  let result = [];
  let pos = ["Determiner", "Noun", "Adjective"];
  for(let i=0; i<jsonObj.terms.length; i++)
  {
    for(let j=0; j<jsonObj.terms.tags.length; j++)
    {
      if(pos.includes(jsonObj.terms[i].tags[j]))
      {
        result.push(jsonObj.terms[i].tags[j]);
      }
    }
  }

  return result.join('');
}


