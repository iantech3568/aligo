document.getElementById('document-input').addEventListener('input', validateDocument);
document.getElementById('document-input').addEventListener('paste', handlePaste);

function validateDocument() {
    const text = document.getElementById('document-input').value;
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const subheadings = text.match(/<\/?h[2-6]>/g) || [];

    checkSentenceLength(sentences);
    checkParagraphLength(paragraphs);
    checkSubheadingDistribution(text);
    checkConsecutiveSentences(sentences);
    checkPassiveVoice(sentences);
    checkTransitionWords(sentences);
    checkReadabilityScore(text, sentences);
    checkContentLength(text);
    checkIntroductionParagraph(text);
    checkNoHeadingBeforeIntro(text);
    checkH3UnderH2(text);
    checkNoLinksFirstParagraph(text);
    checkLinkDensity(text);
    checkTitleTagH1(text);
}

function handlePaste(event) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const shouldKeepFormatting = confirm('Do you want to keep the formatting of the pasted content?');
    insertText(shouldKeepFormatting ? pastedText : pastedText.replace(/<\/?[^>]+(>|$)/g, ""));
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

    let replacementText;
    switch (tag) {
        case 'h2':
            replacementText = `<h2>${selectedText}</h2>`;
            break;
        case 'h3':
            replacementText = `<h3>${selectedText}</h3>`;
            break;
        case 'h4':
            replacementText = `<h4>${selectedText}</h4>`;
            break;
        case 'h5':
            replacementText = `<h5>${selectedText}</h5>`;
            break;
        case 'h6':
            replacementText = `<h6>${selectedText}</h6>`;
            break;
        case 'p':
            replacementText = `<p>${selectedText}</p>`;
            break;
        default:
            replacementText = selectedText;
    }

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

function checkSubheadingDistribution(text) {
    const words = text.split(/\s+/).length;
    const subheadings = (text.match(/<\/h[2-6]>/g) || []).length;
    const avgWordsBetweenSubheadings = words / (subheadings + 1); // +1 to account for text before the first subheading
    const isValid = avgWordsBetweenSubheadings <= 300;

    updateRequirement('subheading-distribution', isValid, isValid ? 'Valid: No more than 300 words between subheadings' : 'Invalid: More than 300 words between subheadings');
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
    updateRequirement('transition-words', percentage >= 30, `At least ${percentage.toFixed(2)}% of sentences contain a transition word`);
}

function checkReadabilityScore(text, sentences) {
    const words = text.split(/\s+/).length;
    const syllables = text.match(/[aeiouy]{1,2}/gi) ? text.match(/[aeiouy]{1,2}/gi).length : 0;
    const readability = 206.835 - 1.015 * (words / sentences.length) - 84.6 * (syllables / words);
    const isValid = readability >= 60;
    updateRequirement('readability-score', isValid, `Readability score is ${readability.toFixed(2)}`);
}

function checkContentLength(text) {
    const words = text.split(/\s+/).length;
    updateRequirement('content-length', words >= 450, `Content length is ${words} words`);
}

function checkIntroductionParagraph(text) {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const introParagraph = paragraphs[0];
    const sentences = introParagraph.match(/[^\.!\?]+[\.!\?]+/g) || [];
    updateRequirement('introduction-paragraph', sentences.length >= 3 && sentences.length <= 4, `Introduction paragraph has ${sentences.length} sentences`);
}

function checkNoHeadingBeforeIntro(text) {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const introParagraph = paragraphs[0];
    const hasHeadingBeforeIntro = /<\/h[2-6]>/.test(introParagraph);
    updateRequirement('no-heading-before-intro', !hasHeadingBeforeIntro, hasHeadingBeforeIntro ? 'Invalid: Heading found before introduction paragraph' : 'Valid: No heading before introduction paragraph');
}

function checkH3UnderH2(text) {
    const h2h3Pattern = /<h2>.*?<\/h2>([\s\S]*?<h3>)/;
    const matches = text.match(h2h3Pattern);
    const isValid = matches && matches.length > 0;
    updateRequirement('h3-under-h2', isValid, isValid ? 'Valid: H3 exists only under H2' : 'Invalid: H3 exists without preceding H2');
}

function checkNoLinksFirstParagraph(text) {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const firstParagraph = paragraphs[0];
    const hasLink = /<a href=/.test(firstParagraph);
    updateRequirement('no-links-first-paragraph', !hasLink, hasLink ? 'Invalid: Link found in the first paragraph' : 'Valid: No link in the first paragraph');
}

function checkLinkDensity(text) {
    const words = text.split(/\s+/).length;
    const links = (text.match(/<a href=/g) || []).length;
    const linkDensity = words / links;
    updateRequirement('link-density', linkDensity <= 200, `Link density is 1 link per ${linkDensity.toFixed(2)} words`);
}

function checkTitleTagH1(text) {
    const h1Tags = (text.match(/<\/?h1>/g) || []).length;
    const hasTitleTag = document.title.trim().length > 0;
    updateRequirement('title-tag-h1', h1Tags === 0 && hasTitleTag, h1Tags === 0 ? 'Valid: No H1 tags in the body' : 'Invalid: H1 tags found in the body');
}

function updateRequirement(id, isValid, message) {
    const element = document.getElementById(id);
    element.classList.toggle('complete', isValid);
    element.classList.toggle('incomplete', !isValid);
    element.querySelector('span').textContent = message;
}
