document.addEventListener("DOMContentLoaded", () => {
  const pasteArea = document.getElementById("paste-area");
  const validationResults = document.getElementById("validation-results");

  const transitionWords = [
    "additionally", "after", "also", "although", "and", "as", "because", 
    "before", "besides", "but", "consequently", "conversely", "finally", 
    "for example", "for instance", "furthermore", "hence", "however", 
    "in addition", "in conclusion", "in contrast", "in fact", "indeed", 
    "instead", "likewise", "meanwhile", "moreover", "nevertheless", 
    "next", "nonetheless", "on the contrary", "on the other hand", 
    "otherwise", "similarly", "so", "subsequently", "then", "therefore", 
    "thus", "ultimately", "whereas", "while", "yet"
  ];

  function calculateReadability(text) {
    const sentences = text.split(/[.!?]/).filter(Boolean);
    const words = text.split(/\s+/).filter(Boolean).length;
    const syllables = text.split(/[^aeiouy]+/).filter(Boolean).length;
    const sentenceCount = sentences.length;
    const readability = 206.835 - 1.015 * (words / sentenceCount) - 84.6 * (syllables / words);
    return readability;
  }

  function validateText() {
    const text = pasteArea.innerText.trim();
    const sentences = text.split(/[.!?]/).filter(Boolean);
    const words = text.split(/\s+/).filter(Boolean);
    const paragraphs = text.split(/\n+/).filter(Boolean);
    const subheadings = text.split(/<h[2-6][^>]*>/i).filter(Boolean);

    let longSentences = 0;
    let passiveSentences = 0;
    let transitionSentences = 0;
    let linkCount = (text.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/) || []).length;

    sentences.forEach(sentence => {
      const wordCount = sentence.split(/\s+/).filter(Boolean).length;
      if (wordCount > 20) longSentences++;

      const lowerSentence = sentence.toLowerCase();
      const isPassive = lowerSentence.includes("is ") || lowerSentence.includes("was ") || lowerSentence.includes("were ") || lowerSentence.includes("has been ") || lowerSentence.includes("have been ");
      if (isPassive) passiveSentences++;

      const hasTransition = transitionWords.some(word => lowerSentence.includes(word));
      if (hasTransition) transitionSentences++;
    });

    const longSentencesPercentage = (longSentences / sentences.length) * 100;
    const passiveSentencesPercentage = (passiveSentences / sentences.length) * 100;
    const transitionSentencesPercentage = (transitionSentences / sentences.length) * 100;

    const results = {
      sentenceLength: longSentencesPercentage <= 25,
      paragraphLength: !paragraphs.some(p => p.split(/\s+/).filter(Boolean).length > 150),
      subheadingDistribution: !subheadings.some(sh => sh.split(/\s+/).filter(Boolean).length > 300),
      consecutiveSentences: !/(^|\W)(\w+)(\W+\2){2,}/.test(text),
      passiveVoice: passiveSentencesPercentage <= 20,
      transitionWords: transitionSentencesPercentage >= 30,
      readability: calculateReadability(text) >= 60,
      contentLength: words.length >= 450,
      introLength: paragraphs[0] && paragraphs[0].split(/[.!?]/).filter(Boolean).length >= 3 && paragraphs[0].split(/[.!?]/).filter(Boolean).length <= 4,
      noHeadingBeforeIntro: !/^<h[2-6][^>]*>/i.test(paragraphs[0]),
      h3OnlyUnderH2: !/<h3[^>]*>/i.test(paragraphs[0]),
      noLinksInFirstParagraph: !/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/.test(paragraphs[0]),
      linkDensity: linkCount <= words.length / 200,
      noH1InBody: !/<h1[^>]*>/i.test(text)
    };

    displayResults(results);
  }

  function displayResults(results) {
    validationResults.innerHTML = `
      <p>Sentence Length: ${results.sentenceLength ? "✔️" : "❌"}</p>
      <p>Paragraph Length: ${results.paragraphLength ? "✔️" : "❌"}</p>
      <p>Subheading Distribution: ${results.subheadingDistribution ? "✔️" : "❌"}</p>
      <p>Consecutive Sentences with Same Start: ${results.consecutiveSentences ? "✔️" : "❌"}</p>
      <p>Passive Voice: ${results.passiveVoice ? "✔️" : "❌"}</p>
      <p>Transition Word Sentences: ${results.transitionWords ? "✔️" : "❌"}</p>
      <p>Readability Score: ${results.readability ? "✔️" : "❌"}</p>
      <p>Content Length: ${results.contentLength ? "✔️" : "❌"}</p>
      <p>Introduction Paragraph Length: ${results.introLength ? "✔️" : "❌"}</p>
      <p>No Heading Before Introduction Paragraph: ${results.noHeadingBeforeIntro ? "✔️" : "❌"}</p>
      <p>H3 Exists Only Under H2: ${results.h3OnlyUnderH2 ? "✔️" : "❌"}</p>
      <p>No Links in First Paragraph: ${results.noLinksInFirstParagraph ? "✔️" : "❌"}</p>
      <p>Link Density: ${results.linkDensity ? "✔️" : "❌"}</p>
      <p>Title Tag & H1 Headers: ${results.noH1InBody ? "✔️" : "❌"}</p>
    `;
  }

  pasteArea.addEventListener("input", validateText);
  validateText();
});
