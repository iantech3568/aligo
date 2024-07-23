document.getElementById('document-input').addEventListener('input', validateDocument);
document.getElementById('document-input').addEventListener('paste', handlePaste);

function validateDocument() {
    const text = document.getElementById('document-input').value;
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const subheadings = text.match(/\*\*.*?\*\*/g) || [];

    checkSentenceLength(sentences);
    checkParagraphLength(paragraphs);
    checkSubheadingDistribution(paragraphs, subheadings);
    checkConsecutiveSentences(sentences);
    checkPassiveVoice(sentences);
    checkTransitionWords(sentences);
    checkReadabilityScore(text, sentences);
    checkContentLength(text);
}

function handlePaste(event) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    if (confirm('Do you want to keep the formatting of the pasted content?')) {
        insertText(pastedText);
    } else {
        insertText(pastedText.replace(/\*\*.*?\*\*/g, '')); // Remove bold formatting
    }
}

function insertText(text) {
    const textarea = document.getElementById('document-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + text + after;
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
    validateDocument(); // Re-validate after pasting
}

function formatText(tag) {
    const textarea = document.getElementById('document-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacementText = '';
    if (tag === 'P') {
        replacementText = selectedText;
    } else if (tag.startsWith('H')) {
        replacementText = `**${selectedText}**`; // Bold for headings
    }

    // Apply the formatting
    const newValue = textarea.value.substring(0, start) + replacementText + textarea.value.substring(end);
    textarea.value = newValue;
    textarea.focus();
    textarea.setSelectionRange(start, start + replacementText.length);
    validateDocument(); // Re-validate after formatting
}

// Validation functions...

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
        if (subheadings.some(subheading => paragraph.includes(subheading))) {
            wordCount = 0;
        }
    });
    updateRequirement('subheading-distribution', valid, `Words between subheadings: ${wordCount}`);
}

function checkConsecutiveSentences(sentences) {
    let valid = true;
    for (let i = 0; i < sentences.length - 1; i++) {
        if (sentences[i].split(' ')[0] === sentences[i + 1].split(' ')[0]) {
            valid = false;
            break;
        }
    }
    updateRequirement('consecutive-sentences', valid, valid ? "No consecutive sentences start with the same word" : "Consecutive sentences start with the same word");
}

function checkPassiveVoice(sentences) {
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

function checkReadabilityScore(text, sentences) {
    const words = text.split(/\s+/);
    const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    updateRequirement('readability-score', score >= 60, `Readability score: ${score.toFixed(2)}`);
}

function checkContentLength(text) {
    const wordCount = text.trim().split(/\s+/).length;
    updateRequirement('content-length', wordCount >= 400, `Content length: ${wordCount} words`);
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
    return (word.match(/[aeiouy]{1,2}/g) || []).length;                   
}
