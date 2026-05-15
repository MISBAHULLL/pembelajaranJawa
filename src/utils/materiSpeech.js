export const materiNarrationTtsOptions = {
  voice: 'Kore',
  instructions:
    'This is learning material about parikan. Read it like a patient Bahasa Jawa teacher explaining to SMP students. Pause briefly before the example after the word Tuladha.',
};

export function getMateriNarrationText(item) {
  return `${item.title}. ${item.body}${item.example ? '. Tuladha: ' + item.example : ''}`;
}

