import sanitizeHtml from 'sanitize-html';

export const sanitizeText = html => {
  return sanitizeHtml(html, {
    allowedTags: ['a', 'code', 'i', 'strong'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    }
  });
};
