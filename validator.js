document.getElementById('document-input').addEventListener('input', validateDocument);

function validateDocument() {
    const text = document.getElementById('document-input').value;
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const subheadings = text.match(/<h\d>.*?<\/h\d>/g) || [];
    
    checkSentenceLength(sentences);
    checkParagraphLength(paragraphs);
    checkSubheadingDistribution(paragraphs, subheadings);
    checkConsecutiveSentences(sentences);
    checkPassiveVoice(sentences);
    checkTransitionWords(sentences);
    checkReadabilityScore(text);
    checkContentLength(text);
    checkIntroLength(paragraphs[0]);
}

function checkSentenceLength(sentences) {
    const longSentences = sentences.filter(sentence => sentence.split(' ').length > 20).length;
    const percentage = (longSentences / sentences.length) * 100;
    updateRequirement('sentence-length', percentage <= 25, `Only ${percentage.toFixed(2)}% of sentences are longer than 20 words`);
}

function checkParagraphLength(paragraphs) {
    const longParagraphs = paragraphs.filter(paragraph => paragraph.split(' ').length > 150).length;
    updateRequirement('paragraph-length', longParagraphs === 0, `${longParagraphs} paragraphs are longer than 150 words`);
}

function checkSubheadingDistribution(paragraphs, subheadings) {
    let wordCount = 0;
    let valid = true;
    paragraphs.forEach(paragraph => {
        wordCount += paragraph.split(' ').length;
        if (wordCount > 300) {
            valid = false;
        }
        if (subheadings.includes(paragraph)) {
            wordCount = 0;
        }
    });
    updateRequirement('subheading-distribution', valid, `Words between subheadings: ${wordCount}`);
}

function checkConsecutiveSentences(sentences) {
    let valid = true;
    for (let i = 0; i < sentences.length - 2; i++) {
        if (sentences[i].split(' ')[0] === sentences[i + 1].split(' ')[0] &&
            sentences[i + 1].split(' ')[0] === sentences[i + 2].split(' ')[0]) {
            valid = false;
            break;
        }
    }
    updateRequirement('consecutive-sentences', valid, valid ? "No consecutive sentences start with the same word" : "Consecutive sentences start with the same word");
}

function checkPassiveVoice(sentences) {
    // Note: This is a simplistic check and might not be very accurate
    const passiveIndicators = ['is', 'was', 'were', 'been', 'be', 'being', 'by'];
    const passiveSentences = sentences.filter(sentence => passiveIndicators.some(word => sentence.includes(` ${word} `))).length;
    const percentage = (passiveSentences / sentences.length) * 100;
    updateRequirement('passive-voice', percentage <= 20, `Only ${percentage.toFixed(2)}% of sentences are in passive voice`);
}

function checkTransitionWords(sentences) {
    const transitionWords = ['also', 'but', 'moreover', 'however', 'therefore', 'furthermore', 'additionally', 'similarly'];
    const transitionSentences = sentences.filter(sentence => transitionWords.some(word => sentence.includes(` ${word} `))).length;
    const percentage = (transitionSentences / sentences.length) * 100;
    updateRequirement('transition-words', percentage >= 30, `${percentage.toFixed(2)}% of sentences include transition words`);
}

function checkReadabilityScore(text) {
    // Note: This is a simplistic readability score using Flesch-Kincaid formula
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const words = text.split(' ');
    const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    updateRequirement('readability-score', score > 60, `Readability score: ${score.toFixed(2)}`);
}

function checkContentLength(text) {
    const wordCount = text.split(' ').length;
    updateRequirement('content-length', wordCount >= 400, `Content length: ${wordCount} words`);
}

function checkIntroLength(intro) {
    const sentences = intro.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const valid = sentences.length >= 3 && sentences.length <= 4;
    updateRequirement('intro-length', valid, `Introduction has ${sentences.length} sentences`);
}

function updateRequirement(id, isValid, message) {
    const requirement = document.getElementById(id);
    requirement.className = `requirement ${isValid ? 'complete' : 'incomplete'}`;
    requirement.querySelector('span').innerText = message;
}

function countSyllables(word) {
    word = word.toLowerCase();                                    
    if(word.length <= 3) { return 1; }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, ''); 
    word = word.replace(/^y/, '');                                
    return word.match(/[aeiouy]{1,2}/g).length;                   
}
