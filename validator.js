document.getElementById('document-input').addEventListener('input', validateDocument);
document.getElementById('document-input').addEventListener('paste', handlePaste);

function validateDocument() {
    const text = document.getElementById('document-input').value;
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const subheadings = text.match(/<strong>.*?<\/strong>/g) || [];

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
        insertText(pastedText.replace(/<\/?strong>/g, '')); // Remove bold formatting
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

function countSyllables(word) {
    word = word.toLowerCase();                                    
    if(word.length <= 3) { return 1; }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, ''); 
    word = word.replace(/^y/, '');                                
    return (word.match(/[aeiouy]{1,2}/g) || []).length;                   
}
