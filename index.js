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
    let NPmessage = [];

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
      let {result, msg} = detectNounPhrase(sentences.eq(i));
      for(let j=0; j<msg.length; j++)
      {
        NPmessage.push(msg[j]);
      }

      //store processed text
      processedText.push(`<p class="${bgColor}">${result}</p>`);
    }

    console.log(processedText.join(''));
    output.innerHTML = processedText.join('');

    const nounPhrases = document.querySelectorAll(".nounPhrase");
    let i=0;

    nounPhrases.forEach((phrase) => {
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = NPmessage[i];
      tooltip.style.display = "none";
      phrase.style.position = "relative";
      phrase.appendChild(tooltip);

      phrase.addEventListener("mouseover", function () {
        tooltip.style.display = "block";
      });
      phrase.addEventListener("mouseout", function () {
        tooltip.style.display = "none";
      });
      i++;
    })
  }, 1000);
}

function getType(doc) {

  let NumOfClauses = doc.clauses().length;

  console.log(NumOfClauses);

  const jsonObj = doc.json();
  if (NumOfClauses >= 2)
  {
    if (isCompounds(jsonObj))
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
    if(isComplex(jsonObj))
    {
      return 2;
    }
    else
    {
      return 0;
    }
  }
  else if(NumOfClauses === 0)
  {
    return -1;
  }
}

function isComplex(sentence)
{

  let isFirstNoun = false;
  let isSecondNoun = false;
  let isFirstSet = false;
  let isSecondSet = false;

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
    if(sentence[0].terms[i].tags.includes("Noun"))
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

    if(sentence[0].terms[i].tags.includes("Verb"))
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
      let isIllegal = false;
      if(sentence[0].terms[i].normal==="and")
      {
        if(i<sentence[0].terms.length-2)
        {
          if(sentence[0].terms[i+2].tags.includes("Verb"))
          {
            isFANBOYS = true;
          }
          else
          {
            isIllegal = true;
          }
        }
        else
        {
          isIllegal = true;
        }
      }

      if(isFirstSet && !isIllegal)
      {
        isFANBOYS = true;
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
  let result = doc.text();
  let jsonObj = doc.json();
  let firstNoun = false;

  let NP = [];
  let msg = [];
  msg.push("color");

  let words = [];

  let NPwords = [];

  for(let i=0; i<jsonObj[0].terms.length; i++)
  {
    let isComma = false;
    if(jsonObj[0].terms[i].tags.includes("Noun"))
    {
      NP.push("Noun");
      if(jsonObj[0].terms[i].post==", ") isComma = true;
      let word = jsonObj[0].terms[i].text+jsonObj[0].terms[i].post;
      words.push(word);
      firstNoun = true;
    }
    else if(jsonObj[0].terms[i].tags.includes("Determiner"))
    {
      NP.push("Determiner");
      if(jsonObj[0].terms[i].post==", ") isComma = true;
      let word = jsonObj[0].terms[i].text+jsonObj[0].terms[i].post;
      words.push(word);
    }
    else if(jsonObj[0].terms[i].tags.includes("Adjective"))
    {
      NP.push("Adjective");
      if(jsonObj[0].terms[i].post==", ") isComma = true;
      let word = jsonObj[0].terms[i].text+jsonObj[0].terms[i].post;
      words.push(word);
    }
    else if(jsonObj[0].terms[i].tags.includes("Preposition"))
    {
      NP.push("Preposition");
      if(jsonObj[0].terms[i].post==", ") isComma = true;
      let word = jsonObj[0].terms[i].text+jsonObj[0].terms[i].post;
      words.push(word);
    }
    else if(jsonObj[0].terms[i].text === "and" && firstNoun)
    {
      NP.push("Conjunction");
      if(jsonObj[0].terms[i].post==", ") isComma = true;
      let word = jsonObj[0].terms[i].text+jsonObj[0].terms[i].post;
      words.push(word);
    }
    else
    {
      if(firstNoun)
      {
        if(words.length>0)
        {
          htmlText = `<span class="nounPhrase">`+words.join(' ')+`</span>`;
          NPwords.push(htmlText);
          words = [];
        }
        if(NP.length>0)
        {
          msg.push(NP.join(' '));
          NP = [];
        }
      }
      
      NPwords.push(jsonObj[0].terms[i].text+jsonObj[0].terms[i].post);
      
      firstNoun = false;
    }

    if(isComma)
    {
      console.log("isComma");
      if(words.length>0)
      {
        htmlText = `<span class="nounPhrase">`+words.join(' ')+`</span>`;
        NPwords.push(htmlText);
        words = [];
      }
      if(NP.length>0)
      {
        msg.push(NP.join(' '));
        NP = [];
      }
      
      firstNoun = false;
    }
    
  }

  if(words.length>0)
  {
    htmlText = `<span class="nounPhrase">`+words.join(' ')+`</span>`;
    NPwords.push(htmlText);
  }

  if(NP.length>0)
  {
    msg.push(NP.join(' '));
  }

  for(let i=0; i<NPwords.length; i++)
  {
    result = NPwords.join(' ');
  }
  return {result, msg};
}




