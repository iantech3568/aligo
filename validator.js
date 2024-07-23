document.getElementById('document-input').addEventListener('input', validateDocument);
document.getElementById('document-input').addEventListener('paste', handlePaste);

function validateDocument() {
    const text = document.getElementById('document-input').value;
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const subheadings = text.match(/(?:^|\s)(\*\*.*?\*\*)(?:\s|$)/g) || [];

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
    const shouldKeepFormatting = confirm('Do you want to keep the formatting of the pasted content?');
    insertText(shouldKeepFormatting ? pastedText : pastedText.replace(/(?:^|\s)(\*\*.*?\*\*)(?:\s|$)/g, ''));
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

    const replacementText = `<span class="${tag}">${selectedText}</span>`; // Wrap text with class for heading

    // Apply the formatting
    const newValue = textarea.value.substring(0, start) + replacementText + textarea.value.substring(end);
    textarea.value = newValue;
    textarea.focus();
    textarea.setSelectionRange(start, start + replacementText.length);
    validateDocument(); // Re-validate after formatting
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
    });

    updateRequirement('subheading-distribution', valid, `No more than 300 words between subheadings`);
}

function checkConsecutiveSentences(sentences) {
    let previousStart = '';
    let consecutiveCount = 0;

    sentences.forEach(sentence => {
        const start = sentence.trim().split(' ')[0];
        if (start === previousStart) {
            consecutiveCount++;
        } else {
            consecutiveCount = 0;
        }
        previousStart = start;
    });

    updateRequirement('consecutive-sentences', consecutiveCount <= 1, `No more than 2 consecutive sentences start with the same word`);
}

function checkPassiveVoice(sentences) {
    const passiveVoicePatterns = /(?:was|were|be|been|being)\s+[a-zA-Z]+ed\b/;
    const passiveSentences = sentences.filter(sentence => passiveVoicePatterns.test(sentence)).length;
    const percentage = (passiveSentences / sentences.length) * 100;
    updateRequirement('passive-voice', percentage <= 20, `Only ${percentage.toFixed(2)}% of sentences are in passive voice`);
}

function checkTransitionWords(sentences) {
    const transitionWords = ['also', 'but', 'moreover', 'however', 'furthermore'];
    const transitionSentences = sentences.filter(sentence => transitionWords.some(word => sentence.includes(word))).length;
    const percentage = (transitionSentences / sentences.length) * 100;
    updateRequirement('transition-words', percentage >= 30, `At least ${percentage.toFixed(2)}% of sentences include transition words`);
}

function checkReadabilityScore(text, sentences) {
    const readabilityScore = 206.835 - (1.015 * (text.split(' ').length / sentences.length)) - (84.6 * (sentences.join(' ').split(/\s+/).filter(word => word.length <= 3).length / sentences.length));
    updateRequirement('readability-score', readabilityScore >= 60, `Readability Score: ${readabilityScore.toFixed(2)}`);
}

function checkContentLength(text) {
    const wordCount = text.split(' ').length;
    updateRequirement('content-length', wordCount >= 400, `Content Length: ${wordCount} words`);
}

function updateRequirement(id, isValid, message) {
    const element = document.getElementById(id);
    element.querySelector('span').textContent = message;
    element.className = `requirement ${isValid ? 'complete' : 'incomplete'}`;
}
